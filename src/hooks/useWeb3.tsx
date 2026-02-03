import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ethers } from "ethers";
import { CONTRACT_CONFIG, isContractConfigured } from "@/config/contract";
import contractABI from "../../contracts/contract-abi.json";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

interface Web3ContextType {
  // Connection state
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  contract: ethers.Contract | null;
  isConnecting: boolean;
  isConnected: boolean;
  isAdmin: boolean;
  isVerifiedVoter: boolean;
  voterId: string;
  chainId: number | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToGanache: () => Promise<void>;
  
  // Contract interactions
  refreshVoterStatus: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState(false);
  const [voterId, setVoterId] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);

  const isConnected = !!account && !!provider;

  const checkVoterStatus = async (contractInstance: ethers.Contract, address: string) => {
    try {
      const [verified, id] = await contractInstance.getVoterStatus(address);
      setIsVerifiedVoter(verified);
      setVoterId(id);
    } catch (error) {
      console.error("Error checking voter status:", error);
    }
  };

  const checkAdminStatus = async (contractInstance: ethers.Contract, address: string) => {
    try {
      const adminAddress = await contractInstance.admin();
      setIsAdmin(adminAddress.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const refreshVoterStatus = async () => {
    if (contract && account) {
      await checkVoterStatus(contract, account);
    }
  };

  const switchToGanache = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CONTRACT_CONFIG.GANACHE_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CONTRACT_CONFIG.GANACHE_CHAIN_ID.toString(16)}`,
                chainName: CONTRACT_CONFIG.NETWORK_NAME,
                rpcUrls: [CONTRACT_CONFIG.GANACHE_RPC_URL],
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Ganache network:", addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found", {
        description: "Please install MetaMask to use this application",
      });
      return;
    }

    if (!isContractConfigured()) {
      toast.error("Contract not configured", {
        description: "Please deploy the smart contract and update the contract address in src/config/contract.ts",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await web3Provider.getNetwork();
      
      // Check if on correct network
      if (network.chainId !== CONTRACT_CONFIG.GANACHE_CHAIN_ID) {
        toast.info("Switching to Ganache network...");
        await switchToGanache();
        // Re-initialize after network switch
        const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(updatedProvider);
        
        const signer = updatedProvider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        setContract(contractInstance);
        
        const updatedNetwork = await updatedProvider.getNetwork();
        setChainId(updatedNetwork.chainId);
        
        await checkAdminStatus(contractInstance, accounts[0]);
        await checkVoterStatus(contractInstance, accounts[0]);
      } else {
        setProvider(web3Provider);
        setChainId(network.chainId);
        
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        setContract(contractInstance);
        
        await checkAdminStatus(contractInstance, accounts[0]);
        await checkVoterStatus(contractInstance, accounts[0]);
      }

      setAccount(accounts[0]);
      toast.success("Wallet connected!", {
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error("Connection failed", {
        description: error.message || "Failed to connect wallet",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsAdmin(false);
    setIsVerifiedVoter(false);
    setVoterId("");
    setChainId(null);
    toast.info("Wallet disconnected");
  };

  // Handle account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (contract) {
          checkAdminStatus(contract, accounts[0]);
          checkVoterStatus(contract, accounts[0]);
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, contract]);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && isContractConfigured()) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        isConnecting,
        isConnected,
        isAdmin,
        isVerifiedVoter,
        voterId,
        chainId,
        connectWallet,
        disconnectWallet,
        switchToGanache,
        refreshVoterStatus,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

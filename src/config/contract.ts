// Contract configuration for Ganache local blockchain
export const CONTRACT_CONFIG = {
  // Default Ganache network settings
  GANACHE_RPC_URL: "http://127.0.0.1:7545",
  GANACHE_CHAIN_ID: 1337,
  
  // Contract address - UPDATE THIS after deploying to Ganache
  // Deploy the VotingSystem.sol contract and paste the address here
  CONTRACT_ADDRESS: "0xd9145CCE52D386f254917e481eB44e9943F39138",
  
  // Network display name
  NETWORK_NAME: "Ganache Local",
};

// Helper to check if contract is configured
export const isContractConfigured = () => {
  return CONTRACT_CONFIG.CONTRACT_ADDRESS !== "";
};

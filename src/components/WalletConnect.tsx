import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { Wallet, LogOut, Shield, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { isContractConfigured } from "@/config/contract";

export const WalletConnect = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    isAdmin, 
    isVerifiedVoter,
    voterId,
    connectWallet, 
    disconnectWallet 
  } = useWeb3();

  if (!isContractConfigured()) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <AlertCircle className="h-4 w-4" />
        Contract Not Set
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet} 
        disabled={isConnecting}
        variant="default" 
        size="sm"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          {account?.slice(0, 6)}...{account?.slice(-4)}
          {isAdmin && <Shield className="h-3 w-3 ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium truncate">{account}</p>
          <div className="flex gap-1 mt-1">
            {isAdmin && <Badge variant="default" className="text-xs">Admin</Badge>}
            {isVerifiedVoter ? (
              <Badge variant="secondary" className="text-xs">Verified</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Not Verified</Badge>
            )}
          </div>
          {voterId && (
            <p className="text-xs text-muted-foreground mt-1">Voter ID: {voterId}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

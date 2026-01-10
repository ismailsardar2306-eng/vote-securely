import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Copy, 
  Download, 
  Shield, 
  Clock, 
  Hash, 
  User,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Candidate } from "./CandidateCard";
import { useNavigate } from "react-router-dom";

interface BlockchainReceiptProps {
  candidate: Candidate;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  voterId: string;
}

export const BlockchainReceipt = ({
  candidate,
  transactionHash,
  blockNumber,
  timestamp,
  voterId,
}: BlockchainReceiptProps) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    const receiptData = {
      transactionHash,
      blockNumber,
      timestamp: timestamp.toISOString(),
      voterId,
      candidate: {
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
      },
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vote-receipt-${transactionHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Vote Successfully Recorded!
          </h1>
          <p className="text-muted-foreground">
            Your vote has been securely stored on the blockchain
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden animate-slide-up">
          {/* Gradient Header */}
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <span className="font-display font-semibold">
                  Blockchain Verification Receipt
                </span>
              </div>
              <span className="text-sm opacity-80">#{blockNumber}</span>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6 space-y-6">
            {/* Candidate Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-14 h-14 rounded-full bg-muted overflow-hidden border-2 border-secondary">
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vote cast for</p>
                <h3 className="font-display font-semibold text-foreground">
                  {candidate.name}
                </h3>
                <p className="text-sm text-secondary">{candidate.party}</p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              {/* Transaction Hash */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    Transaction Hash
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transactionHash)}
                    className="h-8"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <code className="text-xs font-mono text-foreground break-all">
                  {transactionHash}
                </code>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {timestamp.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timestamp.toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    Voter ID
                  </div>
                  <code className="text-sm font-mono text-foreground">
                    {voterId.slice(0, 8)}...{voterId.slice(-4)}
                  </code>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
              <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Cryptographically Secured
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This receipt is your proof of vote. It can be independently 
                  verified on the blockchain at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={downloadReceipt}>
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="default" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

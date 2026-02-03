import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBlockchainElection, BlockchainElection, BlockchainCandidate } from "@/hooks/useBlockchainElection";
import { WalletConnect } from "@/components/WalletConnect";
import { Vote, CheckCircle, Clock, Users, AlertCircle, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const BlockchainVotingPage = () => {
  const { isConnected, isVerifiedVoter, account } = useWeb3();
  const { fetchElections, fetchCandidates, hasVotedInElection, castVote, loading } = useBlockchainElection();
  
  const [elections, setElections] = useState<BlockchainElection[]>([]);
  const [selectedElection, setSelectedElection] = useState<BlockchainElection | null>(null);
  const [candidates, setCandidates] = useState<BlockchainCandidate[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<BlockchainCandidate | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Load elections on mount
  useEffect(() => {
    if (isConnected) {
      loadElections();
    }
  }, [isConnected]);

  // Load candidates when election is selected
  useEffect(() => {
    if (selectedElection) {
      loadCandidates(selectedElection.id);
      checkVoteStatus(selectedElection.id);
    }
  }, [selectedElection, account]);

  const loadElections = async () => {
    const data = await fetchElections();
    setElections(data);
  };

  const loadCandidates = async (electionId: number) => {
    const data = await fetchCandidates(electionId);
    setCandidates(data);
  };

  const checkVoteStatus = async (electionId: number) => {
    const voted = await hasVotedInElection(electionId);
    setHasVoted(prev => ({ ...prev, [electionId]: voted }));
  };

  const handleVote = async () => {
    if (!selectedElection || !selectedCandidate) return;
    
    const hash = await castVote(selectedElection.id, selectedCandidate.id);
    if (hash) {
      setTxHash(hash);
      setHasVoted(prev => ({ ...prev, [selectedElection.id]: true }));
      await loadCandidates(selectedElection.id);
    }
    setShowConfirmDialog(false);
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "upcoming": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "completed": return "bg-muted text-muted-foreground border-muted";
      default: return "";
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-lg mx-auto text-center">
            <Card>
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your MetaMask wallet to access the blockchain voting system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnect />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isVerifiedVoter) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-lg mx-auto text-center">
            <Card>
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>Voter Verification Required</CardTitle>
                <CardDescription>
                  Your wallet address has not been verified yet. Please contact an administrator to verify your voter status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your wallet: <code className="bg-muted px-2 py-1 rounded">{account}</code>
                </p>
                <Button variant="outline" onClick={() => window.location.href = "/verification"}>
                  Go to Verification
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">Blockchain Voting</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cast your vote securely on the Ethereum blockchain. Every vote is immutable and verifiable.
            </p>
          </div>

          {txHash && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Vote Recorded on Blockchain!</h3>
                    <p className="text-sm text-muted-foreground">
                      Transaction: {txHash.slice(0, 20)}...{txHash.slice(-10)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://etherscan.io/tx/${txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedElection ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {elections.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No elections available</p>
                  </CardContent>
                </Card>
              ) : (
                elections.map((election) => (
                  <Card 
                    key={election.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedElection(election)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(election.status)}>
                          {election.status}
                        </Badge>
                        {hasVoted[election.id] && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Voted
                          </Badge>
                        )}
                      </div>
                      <CardTitle>{election.title}</CardTitle>
                      <CardDescription>{election.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {election.endDate.toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{election.electionType}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedElection(null);
                  setCandidates([]);
                }}
                className="mb-6"
              >
                ← Back to Elections
              </Button>
              
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedElection.title}</CardTitle>
                      <CardDescription>{selectedElection.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedElection.status)}>
                      {selectedElection.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {hasVoted[selectedElection.id] ? (
                <Card className="mb-8 border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">You've Already Voted</h3>
                    <p className="text-muted-foreground">
                      Your vote has been recorded on the blockchain.
                    </p>
                  </CardContent>
                </Card>
              ) : selectedElection.status !== "active" ? (
                <Card className="mb-8">
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Voting Not Available</h3>
                    <p className="text-muted-foreground">
                      {selectedElection.status === "upcoming" 
                        ? "This election hasn't started yet." 
                        : "This election has ended."}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Candidates ({candidates.length})
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                  <Card 
                    key={candidate.id}
                    className={`transition-all ${
                      selectedElection.status === "active" && !hasVoted[selectedElection.id]
                        ? "cursor-pointer hover:shadow-lg hover:border-primary"
                        : ""
                    } ${selectedCandidate?.id === candidate.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                    onClick={() => {
                      if (selectedElection.status === "active" && !hasVoted[selectedElection.id]) {
                        setSelectedCandidate(candidate);
                      }
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      {candidate.party && (
                        <Badge variant="outline">{candidate.party}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {candidate.bio && (
                        <p className="text-sm text-muted-foreground mb-4">{candidate.bio}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {candidate.voteCount} votes
                        </span>
                        {selectedElection.status === "active" && 
                         !hasVoted[selectedElection.id] && 
                         selectedCandidate?.id === candidate.id && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirmDialog(true);
                            }}
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            Cast Vote
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are about to cast your vote for <strong>{selectedCandidate?.name}</strong> in <strong>{selectedElection?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will record your vote on the blockchain and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={loading}>
              {loading ? "Processing..." : "Confirm Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockchainVotingPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CandidateCard, Candidate } from "@/components/voting/CandidateCard";
import { VoteConfirmationDialog } from "@/components/voting/VoteConfirmationDialog";
import { BlockchainReceipt } from "@/components/voting/BlockchainReceipt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useElection } from "@/hooks/useElection";
import { supabase } from "@/integrations/supabase/client";
import { 
  Vote, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Shield,
  ChevronRight,
  AlertTriangle,
  Loader2,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const generateVoterId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'VTR-';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const VotingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    activeElection, 
    candidates, 
    voteCounts, 
    totalVotes, 
    hasVoted,
    loading: electionLoading,
    castVote,
    checkUserVote 
  } = useElection();

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteComplete, setVoteComplete] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    transactionHash: string;
    blockNumber: number;
    timestamp: Date;
    voterId: string;
  } | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } else {
        setIsVerified(data?.is_verified || false);
      }
      
      setCheckingVerification(false);
    };
    
    checkVerification();
  }, [user]);

  // Check if user has already voted
  useEffect(() => {
    if (user?.id) {
      checkUserVote(user.id);
    }
  }, [user?.id, activeElection?.id]);

  // Transform database candidates to component format
  const transformedCandidates: Candidate[] = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    party: c.party || "Independent",
    position: activeElection?.title || "Candidate",
    image: c.image_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face`,
    manifesto: c.bio ? c.bio.split('\n').filter(Boolean) : [],
    voteCount: voteCounts[c.id] || 0,
  }));

  const filteredCandidates = transformedCandidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCandidateData = transformedCandidates.find(
    (c) => c.id === selectedCandidate
  );

  const handleVoteSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmVote = async () => {
    if (!user || !selectedCandidate) return;
    
    setIsSubmitting(true);
    
    const result = await castVote(selectedCandidate, user.id);
    
    if (result.success) {
      setReceiptData({
        transactionHash: result.hash!,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        timestamp: new Date(),
        voterId: generateVoterId(),
      });
      
      setShowConfirmDialog(false);
      setVoteComplete(true);
      toast.success("Vote cast successfully!");
    } else {
      toast.error(result.error || "Failed to cast vote");
    }
    
    setIsSubmitting(false);
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!activeElection?.end_date) return "N/A";
    const end = new Date(activeElection.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Show loading while checking verification
  if (checkingVerification || electionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show verification required message
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="p-4 bg-yellow-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Verification Required</h1>
              <p className="text-muted-foreground mb-8">
                You need to verify your identity before you can participate in elections. 
                Please submit your ID documents for verification.
              </p>
              <Button onClick={() => navigate('/verification')} size="lg">
                <Shield className="h-4 w-4 mr-2" />
                Get Verified
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show no active election message
  if (!activeElection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="p-4 bg-muted rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Vote className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-4">No Active Elections</h1>
              <p className="text-muted-foreground mb-8">
                There are no active elections at the moment. Check back later for upcoming elections.
              </p>
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                Return Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show already voted message
  if (hasVoted && !voteComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="p-4 bg-secondary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-secondary" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Already Voted</h1>
              <p className="text-muted-foreground mb-8">
                You have already cast your vote in this election. Your vote has been securely recorded on the blockchain.
              </p>
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                Return Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show receipt if vote is complete
  if (voteComplete && selectedCandidateData && receiptData) {
    return (
      <BlockchainReceipt
        candidate={selectedCandidateData}
        transactionHash={receiptData.transactionHash}
        blockNumber={receiptData.blockNumber}
        timestamp={receiptData.timestamp}
        voterId={receiptData.voterId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Election Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-secondary">
                  Live Election
                </span>
                <TrendingUp className="w-4 h-4 text-secondary" />
              </span>
              
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {activeElection.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {activeElection.description || "Select your preferred candidate. Your vote will be securely recorded on the blockchain."}
              </p>
            </div>

            {/* Election Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Clock className="w-5 h-5 text-secondary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Ends In</p>
                <p className="font-display font-semibold text-foreground">{getTimeRemaining()}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent animate-pulse" />
                <Users className="w-5 h-5 text-secondary mx-auto mb-2 relative z-10" />
                <p className="text-xs text-muted-foreground relative z-10">Total Votes</p>
                <p className="font-display font-semibold text-foreground relative z-10 tabular-nums">
                  {totalVotes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Shield className="w-5 h-5 text-secondary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="font-display font-semibold text-foreground">100%</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search candidates by name or party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="max-w-4xl mx-auto">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No candidates found for this election.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidate === candidate.id}
                    onSelect={setSelectedCandidate}
                    showVoteCount
                    totalVotes={totalVotes}
                  />
                ))}
              </div>
            )}

            {/* Submit Vote Button */}
            <div className="sticky bottom-4 bg-background/80 backdrop-blur-lg p-4 rounded-2xl border border-border shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  {selectedCandidateData ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-secondary">
                        <img
                          src={selectedCandidateData.image}
                          alt={selectedCandidateData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Selected</p>
                        <p className="font-medium text-foreground">
                          {selectedCandidateData.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Select a candidate to cast your vote
                    </p>
                  )}
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  disabled={!selectedCandidate}
                  onClick={handleVoteSubmit}
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Cast Vote
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <VoteConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        candidate={selectedCandidateData || null}
        onConfirm={handleConfirmVote}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VotingPage;

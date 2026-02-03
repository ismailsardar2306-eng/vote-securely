import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBlockchainElection, BlockchainElection, BlockchainCandidate } from "@/hooks/useBlockchainElection";
import { WalletConnect } from "@/components/WalletConnect";
import { Plus, Users, Vote, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BlockchainAdminPage = () => {
  const { isConnected, isAdmin, account, contract } = useWeb3();
  const { 
    fetchElections, 
    fetchCandidates, 
    createElection, 
    addCandidate, 
    verifyVoter, 
    getTotalVotes,
    loading 
  } = useBlockchainElection();

  const [elections, setElections] = useState<BlockchainElection[]>([]);
  const [selectedElection, setSelectedElection] = useState<BlockchainElection | null>(null);
  const [candidates, setCandidates] = useState<BlockchainCandidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});

  // Dialog states
  const [showElectionDialog, setShowElectionDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  // Form states
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    electionType: "state",
    startDate: "",
    endDate: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    bio: "",
    imageUrl: "",
  });

  const [verifyForm, setVerifyForm] = useState({
    walletAddress: "",
    voterId: "",
  });

  useEffect(() => {
    if (isConnected && isAdmin) {
      loadElections();
    }
  }, [isConnected, isAdmin]);

  useEffect(() => {
    if (selectedElection) {
      loadCandidates(selectedElection.id);
      loadVoteCount(selectedElection.id);
    }
  }, [selectedElection]);

  const loadElections = async () => {
    const data = await fetchElections();
    setElections(data);
  };

  const loadCandidates = async (electionId: number) => {
    const data = await fetchCandidates(electionId);
    setCandidates(data);
  };

  const loadVoteCount = async (electionId: number) => {
    const count = await getTotalVotes(electionId);
    setVoteCounts(prev => ({ ...prev, [electionId]: count }));
  };

  const handleCreateElection = async () => {
    const id = await createElection(
      electionForm.title,
      electionForm.description,
      electionForm.electionType,
      new Date(electionForm.startDate),
      new Date(electionForm.endDate)
    );
    
    if (id) {
      await loadElections();
      setShowElectionDialog(false);
      setElectionForm({ title: "", description: "", electionType: "state", startDate: "", endDate: "" });
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedElection) return;
    
    const id = await addCandidate(
      selectedElection.id,
      candidateForm.name,
      candidateForm.party,
      candidateForm.bio,
      candidateForm.imageUrl
    );
    
    if (id) {
      await loadCandidates(selectedElection.id);
      setShowCandidateDialog(false);
      setCandidateForm({ name: "", party: "", bio: "", imageUrl: "" });
    }
  };

  const handleVerifyVoter = async () => {
    const success = await verifyVoter(verifyForm.walletAddress, verifyForm.voterId);
    
    if (success) {
      setShowVerifyDialog(false);
      setVerifyForm({ walletAddress: "", voterId: "" });
    }
  };

  if (!isConnected) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Connect your admin wallet to manage the blockchain voting system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Your wallet is not registered as an admin on the smart contract.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connected wallet: <code className="bg-muted px-2 py-1 rounded">{account}</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Blockchain Admin</h1>
            <p className="text-muted-foreground">Manage elections and voters on the blockchain</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowVerifyDialog(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Voter
            </Button>
            <Button onClick={() => setShowElectionDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Elections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{elections.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Elections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {elections.filter(e => e.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Elections List */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Elections</CardTitle>
              <CardDescription>Select an election to manage candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {elections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No elections created yet
                  </p>
                ) : (
                  elections.map((election) => (
                    <div
                      key={election.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedElection?.id === election.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedElection(election)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{election.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {election.electionType} • {voteCounts[election.id] || 0} votes
                          </p>
                        </div>
                        <Badge variant={election.status === "active" ? "default" : "secondary"}>
                          {election.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Candidates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>
                    {selectedElection ? selectedElection.title : "Select an election"}
                  </CardDescription>
                </div>
                {selectedElection && (
                  <Button size="sm" onClick={() => setShowCandidateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedElection ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select an election to view candidates
                </p>
              ) : candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No candidates added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{candidate.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {candidate.party || "Independent"} • {candidate.voteCount} votes
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Election Dialog */}
      <Dialog open={showElectionDialog} onOpenChange={setShowElectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Election</DialogTitle>
            <DialogDescription>
              Create a new election on the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={electionForm.title}
                onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                placeholder="Election title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={electionForm.description}
                onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                placeholder="Election description"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={electionForm.electionType}
                onValueChange={(value) => setElectionForm({ ...electionForm, electionType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={electionForm.startDate}
                  onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={electionForm.endDate}
                  onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowElectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateElection} disabled={loading}>
              {loading ? "Creating..." : "Create Election"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>
              Add a candidate to {selectedElection?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                placeholder="Candidate name"
              />
            </div>
            <div>
              <Label>Party</Label>
              <Input
                value={candidateForm.party}
                onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                placeholder="Party affiliation (optional)"
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={candidateForm.bio}
                onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                placeholder="Short biography (optional)"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={candidateForm.imageUrl}
                onChange={(e) => setCandidateForm({ ...candidateForm, imageUrl: e.target.value })}
                placeholder="https://... (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCandidateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidate} disabled={loading}>
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Voter Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Voter</DialogTitle>
            <DialogDescription>
              Verify a wallet address to allow voting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Wallet Address</Label>
              <Input
                value={verifyForm.walletAddress}
                onChange={(e) => setVerifyForm({ ...verifyForm, walletAddress: e.target.value })}
                placeholder="0x..."
              />
            </div>
            <div>
              <Label>Voter ID</Label>
              <Input
                value={verifyForm.voterId}
                onChange={(e) => setVerifyForm({ ...verifyForm, voterId: e.target.value })}
                placeholder="Voter identification number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyVoter} disabled={loading}>
              {loading ? "Verifying..." : "Verify Voter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BlockchainAdminPage;

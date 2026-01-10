import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  election: string;
  image: string;
  manifesto: string[];
  votes: number;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    party: "Progressive Alliance",
    position: "Student Council President",
    election: "Student Council 2024",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    manifesto: ["Improve campus sustainability", "Mental health support", "Student networking"],
    votes: 456,
  },
  {
    id: "2",
    name: "Michael Chen",
    party: "Unity Movement",
    position: "Student Council President",
    election: "Student Council 2024",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    manifesto: ["Campus technology", "Startup hub", "International programs"],
    votes: 389,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    party: "Student First Coalition",
    position: "Student Council President",
    election: "Student Council 2024",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    manifesto: ["Reduce fees", "Better dining", "Extended hours"],
    votes: 298,
  },
  {
    id: "4",
    name: "James Thompson",
    party: "Independent",
    position: "Student Council President",
    election: "Student Council 2024",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    manifesto: ["Transparent budget", "Feedback system", "Community outreach"],
    votes: 104,
  },
  {
    id: "5",
    name: "Dr. Robert Williams",
    party: "Academic Excellence",
    position: "Faculty Senate",
    election: "Faculty Senate Q1 2024",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    manifesto: ["Research funding", "Faculty benefits", "Tenure reform"],
    votes: 234,
  },
];

const elections = [
  "Student Council 2024",
  "Faculty Senate Q1 2024",
  "State Governor Primary",
  "Department Head Election",
];

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterElection, setFilterElection] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    position: "",
    election: "",
    image: "",
    manifesto: "",
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesElection =
      filterElection === "all" || candidate.election === filterElection;
    return matchesSearch && matchesElection;
  });

  const handleCreateCandidate = () => {
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: formData.name,
      party: formData.party,
      position: formData.position,
      election: formData.election,
      image: formData.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face",
      manifesto: formData.manifesto.split("\n").filter((m) => m.trim()),
      votes: 0,
    };
    setCandidates([newCandidate, ...candidates]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditCandidate = () => {
    if (!editingCandidate) return;
    setCandidates(
      candidates.map((c) =>
        c.id === editingCandidate.id
          ? {
              ...c,
              name: formData.name,
              party: formData.party,
              position: formData.position,
              election: formData.election,
              image: formData.image || c.image,
              manifesto: formData.manifesto.split("\n").filter((m) => m.trim()),
            }
          : c
      )
    );
    setEditingCandidate(null);
    resetForm();
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      party: "",
      position: "",
      election: "",
      image: "",
      manifesto: "",
    });
  };

  const openEditDialog = (candidate: Candidate) => {
    setFormData({
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      election: candidate.election,
      image: candidate.image,
      manifesto: candidate.manifesto.join("\n"),
    });
    setEditingCandidate(candidate);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Candidates
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage candidates across all elections
            </p>
          </div>
          <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Candidate
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterElection} onValueChange={setFilterElection}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by election" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Elections</SelectItem>
              {elections.map((election) => (
                <SelectItem key={election} value={election}>
                  {election}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Candidates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border-2 border-secondary">
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(candidate)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteCandidate(candidate.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-display font-semibold text-foreground">
                  {candidate.name}
                </h3>
                <p className="text-sm text-secondary font-medium">
                  {candidate.party}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {candidate.position}
                </p>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Election</p>
                  <p className="text-sm font-medium text-foreground">
                    {candidate.election}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-foreground">
                      {candidate.votes.toLocaleString()} votes
                    </span>
                  </div>
                  <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{
                        width: `${Math.min((candidate.votes / 500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingCandidate}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingCandidate(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCandidate ? "Edit Candidate" : "Add New Candidate"}
              </DialogTitle>
              <DialogDescription>
                {editingCandidate
                  ? "Update the candidate's information below."
                  : "Fill in the details to add a new candidate."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party">Party/Affiliation</Label>
                  <Input
                    id="party"
                    placeholder="Progressive Alliance"
                    value={formData.party}
                    onChange={(e) =>
                      setFormData({ ...formData, party: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Student Council President"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Election</Label>
                <Select
                  value={formData.election}
                  onValueChange={(value) =>
                    setFormData({ ...formData, election: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select election" />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.map((election) => (
                      <SelectItem key={election} value={election}>
                        {election}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manifesto">Manifesto Points (one per line)</Label>
                <Textarea
                  id="manifesto"
                  placeholder="Point 1&#10;Point 2&#10;Point 3"
                  rows={4}
                  value={formData.manifesto}
                  onChange={(e) =>
                    setFormData({ ...formData, manifesto: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingCandidate(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={editingCandidate ? handleEditCandidate : handleCreateCandidate}
              >
                {editingCandidate ? "Save Changes" : "Add Candidate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CandidatesPage;

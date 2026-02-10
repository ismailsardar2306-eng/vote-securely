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
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCandidatesAdmin } from "@/hooks/useCandidatesAdmin";

const CandidatesPage = () => {
  const {
    candidates,
    elections,
    loading,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  } = useCandidatesAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterElection, setFilterElection] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    bio: "",
    image_url: "",
    election_id: "",
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesElection =
      filterElection === "all" || candidate.election_id === filterElection;
    return matchesSearch && matchesElection;
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.election_id) return;
    const success = await createCandidate(formData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!editingCandidateId || !formData.name || !formData.election_id) return;
    const success = await updateCandidate(editingCandidateId, formData);
    if (success) {
      setEditingCandidateId(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCandidate(id);
  };

  const resetForm = () => {
    setFormData({ name: "", party: "", bio: "", image_url: "", election_id: "" });
  };

  const openEditDialog = (candidate: typeof candidates[0]) => {
    setFormData({
      name: candidate.name,
      party: candidate.party || "",
      bio: candidate.bio || "",
      image_url: candidate.image_url || "",
      election_id: candidate.election_id,
    });
    setEditingCandidateId(candidate.id);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground mt-1">Manage candidates across all elections</p>
          </div>
          <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Candidate
          </Button>
        </div>

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
                <SelectItem key={election.id} value={election.id}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No candidates found. Add one to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border-2 border-secondary">
                      {candidate.image_url ? (
                        <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
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
                          onClick={() => handleDelete(candidate.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-display font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-secondary font-medium">{candidate.party || "Independent"}</p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Election</p>
                    <p className="text-sm font-medium text-foreground">{candidate.election_title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingCandidateId}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingCandidateId(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCandidateId ? "Edit Candidate" : "Add New Candidate"}
              </DialogTitle>
              <DialogDescription>
                {editingCandidateId
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party">Party/Affiliation</Label>
                  <Input
                    id="party"
                    placeholder="Progressive Alliance"
                    value={formData.party}
                    onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Election</Label>
                <Select
                  value={formData.election_id}
                  onValueChange={(value) => setFormData({ ...formData, election_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select election" />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Profile Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description of the candidate..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingCandidateId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={editingCandidateId ? handleEdit : handleCreate}
              >
                {editingCandidateId ? "Save Changes" : "Add Candidate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CandidatesPage;

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, Users, Vote, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useElectionsAdmin } from "@/hooks/useElectionsAdmin";

const ElectionsPage = () => {
  const { elections, loading, createElection, deleteElection, updateElectionStatus } = useElectionsAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const filteredElections = elections.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date) return;
    const success = await createElection(formData);
    if (success) {
      setIsCreateDialogOpen(false);
      setFormData({ title: "", description: "", start_date: "", end_date: "" });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteElection(deletingId);
    setDeletingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "completed": return "bg-muted text-muted-foreground";
      case "upcoming": return "bg-secondary/20 text-secondary";
      case "draft": return "bg-orange-100 text-orange-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Elections</h1>
            <p className="text-muted-foreground mt-1">Create and manage elections</p>
          </div>
          <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Election
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading elections...</p>
        ) : filteredElections.length === 0 ? (
          <p className="text-muted-foreground">No elections found.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <Card key={election.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getStatusColor(election.status)}`}>
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                      <CardTitle className="font-display text-lg">{election.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={election.status === "active"}
                        onCheckedChange={(checked) =>
                          updateElectionStatus(election.id, checked ? "active" : "upcoming")
                        }
                        aria-label="Toggle election active"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(election.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {election.description || "No description"}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-foreground font-medium">{election.candidateCount} candidates</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Vote className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">{election.totalVotes.toLocaleString()} votes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Election</DialogTitle>
              <DialogDescription>Fill in the details to create a new election.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Election Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Student Council Election 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the election..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleCreate}>
                Create Election
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Election?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All associated candidates and votes will also be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ElectionsPage;

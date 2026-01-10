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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Users,
  Vote,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Election {
  id: string;
  name: string;
  description: string;
  type: "state" | "college";
  status: "draft" | "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  candidates: number;
  totalVotes: number;
}

const mockElections: Election[] = [
  {
    id: "1",
    name: "Student Council Election 2024",
    description: "Annual election for student council president and representatives",
    type: "college",
    status: "active",
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    candidates: 4,
    totalVotes: 1247,
  },
  {
    id: "2",
    name: "Faculty Senate Q1 2024",
    description: "Quarterly faculty senate member election",
    type: "college",
    status: "completed",
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    candidates: 6,
    totalVotes: 892,
  },
  {
    id: "3",
    name: "State Governor Primary",
    description: "Primary election for state governor candidates",
    type: "state",
    status: "upcoming",
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    candidates: 5,
    totalVotes: 0,
  },
  {
    id: "4",
    name: "Department Head Election",
    description: "Election for Computer Science department head",
    type: "college",
    status: "draft",
    startDate: "",
    endDate: "",
    candidates: 3,
    totalVotes: 0,
  },
];

const ElectionsPage = () => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "college" as "state" | "college",
    startDate: "",
    endDate: "",
  });

  const filteredElections = elections.filter((election) =>
    election.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateElection = () => {
    const newElection: Election = {
      id: Date.now().toString(),
      ...formData,
      status: "draft",
      candidates: 0,
      totalVotes: 0,
    };
    setElections([newElection, ...elections]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditElection = () => {
    if (!editingElection) return;
    setElections(
      elections.map((e) =>
        e.id === editingElection.id ? { ...e, ...formData } : e
      )
    );
    setEditingElection(null);
    resetForm();
  };

  const handleDeleteElection = (id: string) => {
    setElections(elections.filter((e) => e.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "college",
      startDate: "",
      endDate: "",
    });
  };

  const openEditDialog = (election: Election) => {
    setFormData({
      name: election.name,
      description: election.description,
      type: election.type,
      startDate: election.startDate,
      endDate: election.endDate,
    });
    setEditingElection(election);
  };

  const getStatusColor = (status: Election["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "upcoming":
        return "bg-secondary/20 text-secondary";
      case "draft":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Elections
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all elections
            </p>
          </div>
          <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Election
          </Button>
        </div>

        {/* Search */}
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

        {/* Elections Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <Card key={election.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getStatusColor(
                        election.status
                      )}`}
                    >
                      {election.status.charAt(0).toUpperCase() +
                        election.status.slice(1)}
                    </span>
                    <CardTitle className="font-display text-lg">
                      {election.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(election)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteElection(election.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {election.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {election.startDate
                        ? `${election.startDate} - ${election.endDate}`
                        : "Dates not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="text-foreground font-medium">
                        {election.candidates} candidates
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Vote className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium">
                        {election.totalVotes.toLocaleString()} votes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    Manage Candidates
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingElection}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingElection(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingElection ? "Edit Election" : "Create New Election"}
              </DialogTitle>
              <DialogDescription>
                {editingElection
                  ? "Update the election details below."
                  : "Fill in the details to create a new election."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Election Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Student Council Election 2024"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the election..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Election Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="college"
                      checked={formData.type === "college"}
                      onChange={() =>
                        setFormData({ ...formData, type: "college" })
                      }
                      className="w-4 h-4 text-secondary"
                    />
                    <span className="text-sm">College</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="state"
                      checked={formData.type === "state"}
                      onChange={() =>
                        setFormData({ ...formData, type: "state" })
                      }
                      className="w-4 h-4 text-secondary"
                    />
                    <span className="text-sm">State</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingElection(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={editingElection ? handleEditElection : handleCreateElection}
              >
                {editingElection ? "Save Changes" : "Create Election"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ElectionsPage;

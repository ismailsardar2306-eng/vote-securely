import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Trophy, Users, Clock, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const COLORS = [
  "hsl(174, 72%, 40%)",
  "hsl(221, 83%, 25%)",
  "hsl(215, 16%, 47%)",
  "hsl(210, 40%, 80%)",
  "hsl(0, 84%, 60%)",
  "hsl(45, 93%, 47%)",
  "hsl(280, 60%, 50%)",
  "hsl(150, 60%, 40%)",
];

interface ElectionOption {
  id: string;
  title: string;
  status: string;
}

interface CandidateResult {
  name: string;
  party: string;
  votes: number;
  color: string;
}

const ResultsPage = () => {
  const [elections, setElections] = useState<ElectionOption[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch elections list
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("elections")
        .select("id, title, status")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setElections(data);
        setSelectedElectionId(data[0].id);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // Fetch results for selected election
  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchResults = async () => {
      const election = elections.find((e) => e.id === selectedElectionId);
      setStatus(election?.status || "");

      // Get candidates
      const { data: candidatesData } = await supabase
        .from("candidates")
        .select("id, name, party")
        .eq("election_id", selectedElectionId);

      // Get vote counts
      const { data: voteCounts } = await supabase
        .from("vote_counts")
        .select("candidate_id, vote_count")
        .eq("election_id", selectedElectionId);

      const countsMap: Record<string, number> = {};
      let total = 0;
      voteCounts?.forEach((v) => {
        if (v.candidate_id) {
          countsMap[v.candidate_id] = v.vote_count || 0;
          total += v.vote_count || 0;
        }
      });

      const results: CandidateResult[] = (candidatesData || []).map((c, i) => ({
        name: c.name,
        party: c.party || "Independent",
        votes: countsMap[c.id] || 0,
        color: COLORS[i % COLORS.length],
      }));

      results.sort((a, b) => b.votes - a.votes);
      setCandidates(results);
      setTotalVotes(total);
    };

    fetchResults();

    // Realtime updates
    const channel = supabase
      .channel(`results-${selectedElectionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes", filter: `election_id=eq.${selectedElectionId}` },
        () => fetchResults()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedElectionId, elections]);

  const winner = candidates.length > 0 ? candidates[0] : null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-muted-foreground">Loading...</div>
      </AdminLayout>
    );
  }

  if (elections.length === 0) {
    return (
      <AdminLayout>
        <div className="p-8 text-muted-foreground">No elections found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Election Results</h1>
            <p className="text-muted-foreground mt-1">View detailed voting analytics and results</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {elections.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leading</p>
                  <p className="font-display font-semibold text-foreground">
                    {winner ? winner.name : "No votes yet"}
                  </p>
                  {winner && <p className="text-xs text-secondary">{winner.votes} votes</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {totalVotes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-100">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === "active" ? "bg-green-100 text-green-700"
                    : status === "completed" ? "bg-muted text-muted-foreground"
                    : "bg-secondary/20 text-secondary"
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground">No candidates or votes for this election yet.</p>
        ) : (
          <>
            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Vote Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={candidates} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                        <XAxis type="number" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="hsl(215, 16%, 47%)" fontSize={12} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 32%, 91%)", borderRadius: "8px" }} />
                        <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                          {candidates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Vote Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie data={candidates} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="votes">
                          {candidates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {candidates.map((candidate, index) => {
                        const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: candidate.color }} />
                              <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                                {candidate.name.split(" ")[0]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Party</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Share</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate, index) => {
                        const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-foreground">{candidate.name}</td>
                            <td className="py-4 px-4 text-muted-foreground">{candidate.party}</td>
                            <td className="py-4 px-4 font-medium text-foreground">{candidate.votes.toLocaleString()}</td>
                            <td className="py-4 px-4 text-foreground">{percentage}%</td>
                            <td className="py-4 px-4">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%`, backgroundColor: candidate.color }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ResultsPage;

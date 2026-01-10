import { useState } from "react";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Trophy, Users, TrendingUp, Clock, Download } from "lucide-react";

const electionResults = {
  "Student Council 2024": {
    candidates: [
      { name: "Sarah Mitchell", party: "Progressive Alliance", votes: 456, color: "hsl(174, 72%, 40%)" },
      { name: "Michael Chen", party: "Unity Movement", votes: 389, color: "hsl(221, 83%, 25%)" },
      { name: "Emily Rodriguez", party: "Student First", votes: 298, color: "hsl(215, 16%, 47%)" },
      { name: "James Thompson", party: "Independent", votes: 104, color: "hsl(210, 40%, 80%)" },
    ],
    totalVotes: 1247,
    turnout: 73.5,
    status: "active",
  },
  "Faculty Senate Q1 2024": {
    candidates: [
      { name: "Dr. Robert Williams", party: "Academic Excellence", votes: 234, color: "hsl(174, 72%, 40%)" },
      { name: "Dr. Lisa Park", party: "Innovation Forward", votes: 198, color: "hsl(221, 83%, 25%)" },
      { name: "Prof. John Adams", party: "Traditional Values", votes: 167, color: "hsl(215, 16%, 47%)" },
      { name: "Dr. Maria Santos", party: "Student Focus", votes: 145, color: "hsl(210, 40%, 80%)" },
      { name: "Prof. David Lee", party: "Research First", votes: 98, color: "hsl(0, 84%, 60%)" },
      { name: "Dr. Emma Wilson", party: "Independent", votes: 50, color: "hsl(45, 93%, 47%)" },
    ],
    totalVotes: 892,
    turnout: 68.2,
    status: "completed",
  },
};

const votingTimeline = [
  { time: "9AM", current: 120, previous: 80 },
  { time: "10AM", current: 340, previous: 290 },
  { time: "11AM", current: 580, previous: 450 },
  { time: "12PM", current: 890, previous: 720 },
  { time: "1PM", current: 1100, previous: 950 },
  { time: "2PM", current: 1247, previous: 1080 },
];

const demographics = [
  { name: "18-24", value: 45 },
  { name: "25-34", value: 25 },
  { name: "35-44", value: 15 },
  { name: "45+", value: 15 },
];

const COLORS = ["hsl(174, 72%, 40%)", "hsl(221, 83%, 25%)", "hsl(215, 16%, 47%)", "hsl(210, 40%, 80%)"];

const ResultsPage = () => {
  const [selectedElection, setSelectedElection] = useState("Student Council 2024");
  const results = electionResults[selectedElection as keyof typeof electionResults];
  const winner = results.candidates.reduce((prev, current) =>
    prev.votes > current.votes ? prev : current
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Election Results
            </h1>
            <p className="text-muted-foreground mt-1">
              View detailed voting analytics and results
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(electionResults).map((election) => (
                  <SelectItem key={election} value={election}>
                    {election}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leading</p>
                  <p className="font-display font-semibold text-foreground">
                    {winner.name}
                  </p>
                  <p className="text-xs text-secondary">{winner.votes} votes</p>
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
                    {results.totalVotes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voter Turnout</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {results.turnout}%
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
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      results.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {results.status.charAt(0).toUpperCase() + results.status.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Vote Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Vote Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.candidates} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis type="number" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="hsl(215, 16%, 47%)" 
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                      {results.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Vote Share */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Vote Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.candidates}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="votes"
                    >
                      {results.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {results.candidates.map((candidate, index) => {
                    const percentage = ((candidate.votes / results.totalVotes) * 100).toFixed(1);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: candidate.color }}
                          />
                          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                            {candidate.name.split(" ")[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Voting Timeline */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Voting Timeline (Today vs Yesterday)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={votingTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="time" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="hsl(174, 72%, 40%)"
                      strokeWidth={2}
                      name="Today"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="hsl(215, 16%, 47%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Yesterday"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Voter Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demographics.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Age {item.name}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: COLORS[index],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results Table */}
        <Card className="mt-6 border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Detailed Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Candidate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Party
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Votes
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Share
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...results.candidates]
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => {
                      const percentage = ((candidate.votes / results.totalVotes) * 100).toFixed(1);
                      return (
                        <tr
                          key={index}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-foreground">
                              {candidate.name}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {candidate.party}
                          </td>
                          <td className="py-4 px-4 font-medium text-foreground">
                            {candidate.votes.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-foreground">
                            {percentage}%
                          </td>
                          <td className="py-4 px-4">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: candidate.color,
                                }}
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
      </div>
    </AdminLayout>
  );
};

export default ResultsPage;

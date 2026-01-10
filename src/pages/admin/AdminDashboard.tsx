import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Vote, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statsCards = [
  {
    title: "Total Elections",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Vote,
    color: "bg-secondary/10 text-secondary",
  },
  {
    title: "Active Candidates",
    value: "48",
    change: "+8",
    trend: "up",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Total Votes Cast",
    value: "15,247",
    change: "+1,234",
    trend: "up",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Avg. Turnout",
    value: "73.5%",
    change: "-2.1%",
    trend: "down",
    icon: Clock,
    color: "bg-orange-100 text-orange-600",
  },
];

const votingData = [
  { time: "9AM", votes: 120 },
  { time: "10AM", votes: 340 },
  { time: "11AM", votes: 580 },
  { time: "12PM", votes: 890 },
  { time: "1PM", votes: 1100 },
  { time: "2PM", votes: 1450 },
  { time: "3PM", votes: 1680 },
  { time: "4PM", votes: 1890 },
];

const electionDistribution = [
  { name: "Student Council", value: 45, color: "hsl(174, 72%, 40%)" },
  { name: "State Primary", value: 30, color: "hsl(221, 83%, 25%)" },
  { name: "Faculty Senate", value: 15, color: "hsl(215, 16%, 47%)" },
  { name: "Other", value: 10, color: "hsl(210, 40%, 96%)" },
];

const recentElections = [
  {
    id: 1,
    name: "Student Council 2024",
    status: "active",
    votes: 1247,
    candidates: 4,
    endDate: "2d 14h",
  },
  {
    id: 2,
    name: "Faculty Senate Q1",
    status: "completed",
    votes: 892,
    candidates: 6,
    endDate: "Ended",
  },
  {
    id: 3,
    name: "Department Head",
    status: "upcoming",
    votes: 0,
    candidates: 3,
    endDate: "Starts in 5d",
  },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your elections and voting activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Voting Activity Chart */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">
                Today's Voting Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={votingData}>
                    <defs>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(215, 16%, 47%)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(215, 16%, 47%)"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="votes"
                      stroke="hsl(174, 72%, 40%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVotes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Election Distribution */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">
                Election Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={electionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {electionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {electionDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Elections */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">
              Recent Elections
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Election Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Votes
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Candidates
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Time
                    </th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentElections.map((election) => (
                    <tr
                      key={election.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">
                          {election.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            election.status === "active"
                              ? "bg-green-100 text-green-700"
                              : election.status === "completed"
                              ? "bg-muted text-muted-foreground"
                              : "bg-secondary/20 text-secondary"
                          }`}
                        >
                          {election.status.charAt(0).toUpperCase() +
                            election.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground">
                        {election.votes.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-foreground">
                        {election.candidates}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {election.endDate}
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VotingPage from "./pages/VotingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ElectionsPage from "./pages/admin/ElectionsPage";
import CandidatesPage from "./pages/admin/CandidatesPage";
import ResultsPage from "./pages/admin/ResultsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/elections" element={<ElectionsPage />} />
          <Route path="/admin/candidates" element={<CandidatesPage />} />
          <Route path="/admin/results" element={<ResultsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "@/hooks/useWeb3";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import VotingPage from "./pages/VotingPage";
import VerificationPage from "./pages/VerificationPage";
import BlockchainVotingPage from "./pages/BlockchainVotingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ElectionsPage from "./pages/admin/ElectionsPage";
import CandidatesPage from "./pages/admin/CandidatesPage";
import VerificationsPage from "./pages/admin/VerificationsPage";
import ResultsPage from "./pages/admin/ResultsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import BlockchainAdminPage from "./pages/admin/BlockchainAdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Web3Provider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/verification" 
              element={
                <ProtectedRoute>
                  <VerificationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vote" 
              element={
                <ProtectedRoute>
                  <VotingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/elections" 
              element={
                <ProtectedRoute requireAdmin>
                  <ElectionsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/candidates" 
              element={
                <ProtectedRoute requireAdmin>
                  <CandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/verifications" 
              element={
                <ProtectedRoute requireAdmin>
                  <VerificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/results" 
              element={
                <ProtectedRoute requireAdmin>
                  <ResultsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requireAdmin>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/blockchain-vote" element={<BlockchainVotingPage />} />
            <Route path="/admin/blockchain" element={<BlockchainAdminPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </Web3Provider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

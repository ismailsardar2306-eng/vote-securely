import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string;
  document_type: string;
  updated_at: string;
  voter_id: string | null;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    user_id: string;
  };
}

const VerificationsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    
    // Fetch verification requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      setLoading(false);
      return;
    }
    
    // Fetch profiles for each request
    const userIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', userIds);
    
    // Merge data
    const mergedData = (requestsData || []).map(request => ({
      ...request,
      profiles: profilesData?.find(p => p.user_id === request.user_id) || null
    }));
    
    setRequests(mergedData as VerificationRequest[]);
    setLoading(false);
  };

  const dummyHandler = () => {
    if (false) {
      console.error('Error fetching requests:', '');
    }
    
    setLoading(false);
  };

  const handleViewDocument = async (request: VerificationRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
    
    // Get signed URL for the document
    const { data, error } = await supabase.storage
      .from('id-documents')
      .createSignedUrl(request.document_url, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error getting document URL:', error);
    } else {
      setDocumentUrl(data.signedUrl);
    }
  };

  const handleApprove = async (request: VerificationRequest) => {
    if (!user) return;
    
    setProcessing(true);
    
    // Update verification request
    const { error: requestError } = await supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', request.id);
    
    if (requestError) {
      console.error('Error approving:', requestError);
      setProcessing(false);
      return;
    }
    
    // Update profile is_verified and voter_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_verified: true,
        voter_id: request.voter_id,
      })
      .eq('user_id', request.user_id);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
    }
    
    setProcessing(false);
    setViewDialogOpen(false);
    fetchRequests();
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    
    setProcessing(true);
    
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason || 'Document not acceptable',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedRequest.id);
    
    if (error) {
      console.error('Error rejecting:', error);
    }
    
    setProcessing(false);
    setRejectDialogOpen(false);
    setViewDialogOpen(false);
    setRejectionReason('');
    fetchRequests();
  };

  const openRejectDialog = () => {
    setRejectDialogOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.voter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voter Verifications</h1>
          <p className="text-muted-foreground">Review and approve voter ID verification requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-500">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-destructive">{stats.rejected}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or voter ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No verification requests found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Voter ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {request.voter_id || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Document Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Review Verification Request</DialogTitle>
              <DialogDescription>
                Review the submitted ID document and approve or reject the request
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedRequest.profiles?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedRequest.profiles?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Voter ID</p>
                    <p className="font-medium">{selectedRequest.voter_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">ID Document</p>
                  <div className="border rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center">
                    {documentUrl ? (
                      selectedRequest.document_url.endsWith('.pdf') ? (
                        <iframe 
                          src={documentUrl} 
                          className="w-full h-[400px]"
                          title="ID Document"
                        />
                      ) : (
                        <img 
                          src={documentUrl} 
                          alt="ID Document" 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      )
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                    <p className="text-sm">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={openRejectDialog}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={processing}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Verification</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this verification request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="e.g., Document is unclear, ID expired, etc."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default VerificationsPage;

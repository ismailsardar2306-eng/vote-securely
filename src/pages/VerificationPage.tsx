import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Upload, 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileText
} from 'lucide-react';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface VerificationRequest {
  id: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const VerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('none');
  const [currentRequest, setCurrentRequest] = useState<VerificationRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voterId, setVoterId] = useState('');

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching verification:', error);
    }
    
    if (data) {
      setCurrentRequest(data);
      setVerificationStatus(data.status as VerificationStatus);
    } else {
      setVerificationStatus('none');
    }
    
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, WebP, or PDF file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (!voterId.trim()) {
      setError('Please enter your Voter ID.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, selectedFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Create verification request
      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_url: fileName,
          voter_id: voterId.trim(),
          document_type: 'government_id',
        });
      
      if (insertError) {
        throw insertError;
      }
      
      setSuccess('Verification request submitted successfully! An admin will review your documents.');
      setVerificationStatus('pending');
      fetchVerificationStatus();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to submit verification request.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Not Verified</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Voter Verification</h1>
          <p className="text-muted-foreground">
            Verify your identity to participate in elections
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Verification Status</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            {verificationStatus === 'approved' && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">You are verified!</p>
                  <p className="text-sm text-muted-foreground">You can now participate in elections.</p>
                </div>
              </div>
            )}
            
            {verificationStatus === 'pending' && currentRequest && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-500">Verification Pending</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(currentRequest.created_at).toLocaleDateString()}. 
                    An admin will review your documents soon.
                  </p>
                </div>
              </div>
            )}
            
            {verificationStatus === 'rejected' && currentRequest && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <XCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Verification Rejected</p>
                    {currentRequest.rejection_reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {currentRequest.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can submit a new verification request below.
                </p>
              </div>
            )}
            
            {verificationStatus === 'none' && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Not Yet Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Please submit your ID documents to get verified.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Form */}
        {(verificationStatus === 'none' || verificationStatus === 'rejected') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Submit Verification
              </CardTitle>
              <CardDescription>
                Upload a government-issued ID to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">{success}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voter-id">Voter ID Number</Label>
                  <Input
                    id="voter-id"
                    type="text"
                    placeholder="Enter your voter ID number"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    disabled={uploading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the ID number from your government-issued voter card
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="id-document">ID Document</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="id-document"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label htmlFor="id-document" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP, or PDF (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Accepted Documents:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Government-issued Voter ID Card</li>
                    <li>• Passport</li>
                    <li>• Driver's License</li>
                    <li>• National ID Card</li>
                  </ul>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;

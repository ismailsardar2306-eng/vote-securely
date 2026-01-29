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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { 
  Shield, 
  Mail, 
  Clock, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

type VerificationStep = 'form' | 'otp';

const VerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<VerificationStep>('form');
  const [voterId, setVoterId] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_verified, voter_id')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking verification:', error);
    }
    
    if (data?.is_verified) {
      setIsVerified(true);
    }
    
    setLoading(false);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to verify.');
      return;
    }
    
    if (!voterId.trim()) {
      setError('Please enter your Voter ID.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setDebugOtp(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-verification-otp', {
        body: { voter_id: voterId.trim(), email: email.toLowerCase() },
      });
      
      if (fnError) {
        throw new Error(fnError.message || 'Failed to send verification code');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      // For development/testing, show the OTP if provided
      if (data?.debug_otp) {
        setDebugOtp(data.debug_otp);
      }
      
      setStep('otp');
      setSuccess('Verification code sent! Check your email.');
    } catch (err: any) {
      console.error('OTP request error:', err);
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user) {
      setError('You must be logged in to verify.');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', {
        body: { otp_code: otpCode },
      });
      
      if (fnError) {
        throw new Error(fnError.message || 'Failed to verify code');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      setSuccess(data.message || 'Verification successful!');
      setIsVerified(true);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpCode('');
    setError(null);
    setSuccess(null);
    await handleRequestOTP({ preventDefault: () => {} } as React.FormEvent);
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
      <div className="container max-w-md mx-auto">
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

        {/* Already Verified */}
        {isVerified ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">You are verified!</p>
                  <p className="text-sm text-muted-foreground">You can now participate in elections.</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate('/vote')}
              >
                Go to Elections
              </Button>
            </CardContent>
          </Card>
        ) : step === 'form' ? (
          /* Step 1: Enter Voter ID */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
              <CardDescription>
                Enter your Voter ID to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voter-id">Voter ID Number</Label>
                  <Input
                    id="voter-id"
                    type="text"
                    placeholder="Enter your voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The ID number from your government-issued voter card
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Verification code will be sent to this email
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting || !voterId.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Step 2: Enter OTP */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Enter Verification Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {email}
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
              
              {/* Debug OTP for development */}
              {debugOtp && (
                <Alert className="mb-4 border-blue-500/50 bg-blue-500/10">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-500">
                    <strong>Debug Mode:</strong> Your OTP is <code className="bg-blue-500/20 px-2 py-1 rounded">{debugOtp}</code>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={submitting}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Code expires in 10 minutes</span>
                </div>
                
                <Button 
                  onClick={handleVerifyOTP}
                  className="w-full" 
                  size="lg"
                  disabled={submitting || otpCode.length !== 6}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Identity
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={handleResendOTP}
                    disabled={submitting}
                    className="text-sm"
                  >
                    Didn't receive the code? Resend
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep('form');
                    setOtpCode('');
                    setError(null);
                    setSuccess(null);
                    setDebugOtp(null);
                  }}
                  className="w-full"
                  disabled={submitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Voter ID
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;

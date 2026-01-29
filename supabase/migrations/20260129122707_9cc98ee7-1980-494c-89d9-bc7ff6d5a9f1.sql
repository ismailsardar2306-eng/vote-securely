-- Create OTP verifications table
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own OTP records
CREATE POLICY "Users can view their own OTP records"
ON public.otp_verifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own OTP records
CREATE POLICY "Users can insert their own OTP records"
ON public.otp_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own OTP records (for marking as verified)
CREATE POLICY "Users can update their own OTP records"
ON public.otp_verifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_otp_verifications_user_id ON public.otp_verifications(user_id);
CREATE INDEX idx_otp_verifications_lookup ON public.otp_verifications(user_id, otp_code, verified);
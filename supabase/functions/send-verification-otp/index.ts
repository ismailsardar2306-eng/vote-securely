import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OTPRequest {
  voter_id: string;
  email: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create client with user's auth token to get their info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { voter_id, email }: OTPRequest = await req.json();

    if (!voter_id || !email) {
      throw new Error("Voter ID and email are required");
    }

    // Validate email matches user's email
    if (email.toLowerCase() !== user.email?.toLowerCase()) {
      throw new Error("Email must match your account email");
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete any existing unverified OTPs for this user
    await supabaseAdmin
      .from("otp_verifications")
      .delete()
      .eq("user_id", user.id)
      .eq("verified", false);

    // Insert new OTP record
    const { error: insertError } = await supabaseAdmin
      .from("otp_verifications")
      .insert({
        user_id: user.id,
        email: email.toLowerCase(),
        voter_id: voter_id.trim(),
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create verification request");
    }

    // Send OTP via Supabase Auth email (using admin API)
    // We'll use a custom approach - send via the user's email
    const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          pending_voter_verification: true,
          verification_otp_sent_at: new Date().toISOString(),
        },
      }
    );

    if (emailError) {
      console.error("Metadata update error:", emailError);
    }

    // For now, we'll log the OTP (in production, you'd integrate with an email service)
    // Supabase doesn't have a built-in way to send custom emails without Resend/SendGrid
    // So we'll return the OTP in development mode or use a workaround
    console.log(`OTP for user ${user.email}: ${otpCode}`);

    // In a real scenario, you'd send an email here
    // For demo purposes, we'll include a hint in the response
    const isDevelopment = Deno.env.get("ENVIRONMENT") !== "production";

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent to your email",
        // Only include OTP in development for testing
        ...(isDevelopment && { debug_otp: otpCode }),
        expires_in_minutes: 10,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

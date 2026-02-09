import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyRequest {
  otp_code: string;
}

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

    // Create client with user's auth token
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { otp_code }: VerifyRequest = await req.json();

    if (!otp_code || otp_code.length !== 6) {
      throw new Error("Valid 6-digit OTP code is required");
    }

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("otp_code", otp_code)
      .eq("verified", false)
      .single();

    if (fetchError || !otpRecord) {
      throw new Error("Invalid or expired verification code");
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new Error("Verification code has expired. Please request a new one.");
    }

    // Mark OTP as verified
    const { error: updateOtpError } = await supabaseAdmin
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    if (updateOtpError) {
      console.error("OTP update error:", updateOtpError);
      throw new Error("Failed to verify code");
    }

    // Check if this voter_id is already assigned to another user
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("voter_id", otpRecord.voter_id)
      .neq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("This Voter ID is already registered to another account");
    }

    // Update user's profile to mark as verified
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_verified: true,
        voter_id: otpRecord.voter_id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      throw new Error("Failed to update verification status");
    }

    // Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        is_verified: true,
        voter_id: otpRecord.voter_id,
        verified_at: new Date().toISOString(),
      },
    });

    console.log(`User ${user.email} successfully verified with voter ID: ${otpRecord.voter_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your identity has been verified successfully!",
        voter_id: otpRecord.voter_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

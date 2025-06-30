
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define response for CORS preflight requests
const handleCorsRequest = () => {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    const { phoneNumber, otp } = await req.json();
    
    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Format the phone number to include country code if not already present
    let formattedPhoneNumber = phoneNumber.toString();
    if (!formattedPhoneNumber.startsWith("91")) {
      formattedPhoneNumber = "91" + formattedPhoneNumber;
    }
    
    // First ensure the service_otps table exists
    try {
      const { error: createTableError } = await supabase.rpc(
        'create_service_otps_table'
      );
      
      if (createTableError) {
        // Continue anyway
      }
    } catch (tableError) {
      // Continue with the rest of the code
    }
    
    const { data: otpRecord, error: otpError } = await supabase
      .from("service_otps")
      .select("*")
      .eq("phone_number", formattedPhoneNumber)
      .eq("status_type", "registration")
      .eq("otp_code", otp)
      .eq("verified", false)
      .single();
    
    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please check the code and try again." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      // Delete expired OTP
      const { error: deleteError } = await supabase
        .from("service_otps")
        .delete()
        .eq("id", otpRecord.id);
        
      if (deleteError) {
        // Continue with error response
      }
      
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Delete the OTP record immediately after successful verification
    const { error: deleteError } = await supabase
      .from("service_otps")
      .delete()
      .eq("id", otpRecord.id);
    
    if (deleteError) {
      // Continue with the success response even if deletion fails
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP verified successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in verify-registration-otp:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

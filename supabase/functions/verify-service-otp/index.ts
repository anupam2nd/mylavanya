
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
    const { bookingId, otp, statusType, currentUser } = await req.json();
    
    if (!bookingId || !otp || !statusType) {
      return new Response(
        JSON.stringify({ error: "Booking ID, OTP, and status type are required" }),
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
    
    // Get OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from("service_otps")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("status_type", statusType)
      .eq("otp_code", otp)
      .eq("verified", false)
      .single();
    
    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return new Response(
        JSON.stringify({ error: "OTP expired" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Mark OTP as verified
    await supabase
      .from("service_otps")
      .update({ verified: true })
      .eq("id", otpRecord.id);
    
    // Map statusType to actual status code
    let statusCode;
    let statusName;
    
    switch (statusType) {
      case "start":
        statusCode = "service_started";
        statusName = "Service Started";
        break;
      case "complete":
        statusCode = "done";
        statusName = "Completed";
        break;
      default:
        statusCode = statusType;
        statusName = statusType.charAt(0).toUpperCase() + statusType.slice(1);
    }
    
    // Update booking status
    const now = new Date();
    const updates = {
      Status: statusName,
      StatusUpdated: now.toISOString()
    };
    
    // Add assignee information if provided
    if (currentUser) {
      if (currentUser.role) {
        updates.AssignedBY = currentUser.role;
      }
      
      if (currentUser.Username) {
        updates.AssignedByUser = currentUser.Username;
      }
    }
    
    const { error: updateError } = await supabase
      .from("BookMST")
      .update(updates)
      .eq("id", bookingId);
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update booking status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP verified and booking status updated",
        newStatus: statusName
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing OTP verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

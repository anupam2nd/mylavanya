
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
    // First ensure the service_otps table exists
    try {
      const { error: createTableError } = await supabase.rpc(
        'create_service_otps_table'
      );
      
      if (createTableError) {
        // Continue anyway, as the table might already exist
      }
    } catch (tableError) {
      // Continue with the rest of the code
    }
    
    const { data: otpRecord, error: otpError } = await supabase
      .from("service_otps")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("status_type", statusType)
      .eq("otp_code", otp)
      .eq("verified", false)
      .maybeSingle();
    
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
      // Delete expired OTP
      const { error: deleteError } = await supabase
        .from("service_otps")
        .delete()
        .eq("id", otpRecord.id);
        
      if (deleteError) {
        // Continue with error response
      }
      
      return new Response(
        JSON.stringify({ error: "OTP expired" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Get the correct status_name from statusmst table based on statusType
    let statusName;
    let statusCode;
    
    try {
      // Map statusType to the correct status_code in statusmst table
      let targetStatusCode;
      switch (statusType) {
        case "start":
          targetStatusCode = "start";
          break;
        case "complete":
          targetStatusCode = "complete";
          break;
        default:
          targetStatusCode = statusType;
      }
      
      // Query statusmst by status_code to get the status_name
      const { data: statusData, error: statusError } = await supabase
        .from("statusmst")
        .select("status_name, status_code")
        .eq("status_code", targetStatusCode)
        .eq("active", true)
        .maybeSingle();
      
      if (statusError) {
        // Handle error silently
      }
      
      if (statusData) {
        statusName = statusData.status_name;
        statusCode = statusData.status_code;
      } else {
        // Fallback to hardcoded values
        switch (statusType) {
          case "start":
            statusName = "Service Started";
            statusCode = "start";
            break;
          case "complete":
            statusName = "Completed";
            statusCode = "complete";
            break;
          default:
            statusName = statusType.charAt(0).toUpperCase() + statusType.slice(1);
            statusCode = statusType;
        }
      }
      
    } catch (statusFetchError) {
      // Fallback to hardcoded values
      switch (statusType) {
        case "start":
          statusName = "Service Started";
          statusCode = "start";
          break;
        case "complete":
          statusName = "Completed";
          statusCode = "complete";
          break;
        default:
          statusName = statusType.charAt(0).toUpperCase() + statusType.slice(1);
          statusCode = statusType;
      }
    }
    
    // Update booking status
    const now = new Date();
    const updates = {
      Status: statusName,
      StatusUpdated: now.toISOString()
    };
    
    // Add assignee information if provided
    if (currentUser) {
      // Use user's role instead of name for AssignedBY
      if (currentUser.role) {
        updates.AssignedBY = currentUser.role;
      }
      
      if (currentUser.Username) {
        updates.AssignedByUser = currentUser.Username;
      }
    }
    
    const { error: updateError2 } = await supabase
      .from("BookMST")
      .update(updates)
      .eq("id", bookingId);
    
    if (updateError2) {
      return new Response(
        JSON.stringify({ error: "Failed to update booking status", details: updateError2.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // After successful verification, delete the OTP record
    const { error: deleteError } = await supabase
      .from("service_otps")
      .delete()
      .eq("id", otpRecord.id);
      
    if (deleteError) {
      // Continue even if deletion fails
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
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

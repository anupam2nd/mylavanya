
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
    console.log(`Verifying OTP for booking ${bookingId}, status ${statusType}`);
    
    // First ensure the service_otps table exists
    try {
      const { error: createTableError } = await supabase.rpc(
        'create_service_otps_table'
      );
      
      if (createTableError) {
        console.error("Error ensuring service_otps table exists:", createTableError);
        // Continue anyway, as the table might already exist
      }
    } catch (tableError) {
      console.error("Exception when checking/creating table:", tableError);
      // Continue with the rest of the code
    }
    
    const { data: otpRecord, error: otpError } = await supabase
      .from("service_otps")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("status_type", statusType)
      .eq("otp_code", otp)
      .eq("verified", false)
      .single();
    
    if (otpError || !otpRecord) {
      console.error("Error retrieving OTP record:", otpError);
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
      console.log("OTP expired");
      
      // Delete expired OTP
      const { error: deleteError } = await supabase
        .from("service_otps")
        .delete()
        .eq("id", otpRecord.id);
        
      if (deleteError) {
        console.error("Error deleting expired OTP:", deleteError);
      }
      
      return new Response(
        JSON.stringify({ error: "OTP expired" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
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
      // Use user's role instead of name for AssignedBY
      if (currentUser.role) {
        updates.AssignedBY = currentUser.role;
      }
      
      if (currentUser.Username) {
        updates.AssignedByUser = currentUser.Username;
      }
    }
    
    console.log(`Updating booking ${bookingId} status to ${statusName}`);
    const { error: updateError2 } = await supabase
      .from("BookMST")
      .update(updates)
      .eq("id", bookingId);
    
    if (updateError2) {
      console.error("Error updating booking status:", updateError2);
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
      console.error("Error deleting verified OTP:", deleteError);
      // Continue even if deletion fails
    } else {
      console.log(`Successfully deleted OTP record with ID ${otpRecord.id}`);
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
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

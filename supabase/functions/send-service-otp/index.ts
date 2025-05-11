
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
    const { bookingId, statusType } = await req.json();
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Get SMS API credentials from environment variables
    const smsApiUsername = Deno.env.get("SMS_API_USER_NAME") || "";
    const smsApiPassword = Deno.env.get("SMS_API_PASSWORD") || "";
    const smsApiSenderId = Deno.env.get("SMS_API_SENDER_ID") || "";
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get booking details to find phone number
    const { data: booking, error: bookingError } = await supabase
      .from("BookMST")
      .select("id, Phone_no, name")
      .eq("id", bookingId)
      .single();
    
    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!booking.Phone_no) {
      return new Response(
        JSON.stringify({ error: "Phone number not found for this booking" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Format the phone number to include country code if not already present
    let phoneNumber = booking.Phone_no.toString();
    if (!phoneNumber.startsWith("91")) {
      phoneNumber = "91" + phoneNumber;
    }
    
    // Store OTP in database with expiry (10 minutes)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    // First check if the service_otps table exists, if not create it
    const { error: createTableError } = await supabase.rpc(
      'create_service_otps_table'
    );
    
    if (createTableError) {
      console.error("Error creating table:", createTableError);
      // Continue anyway, as the table might already exist
    }
    
    // Check if there's already an OTP for this booking and status type
    const { data: existingOtps } = await supabase
      .from("service_otps")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("status_type", statusType);
    
    // Use the first OTP record if it exists
    const existingOtp = existingOtps && existingOtps.length > 0 ? existingOtps[0] : null;
    
    if (existingOtp) {
      // Update existing OTP
      const { error: updateError } = await supabase
        .from("service_otps")
        .update({
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          verified: false
        })
        .eq("id", existingOtp.id);
        
      if (updateError) {
        console.error("Error updating OTP:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update OTP", details: updateError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Create new OTP
      const { error: insertError } = await supabase
        .from("service_otps")
        .insert({
          booking_id: bookingId,
          otp_code: otp,
          status_type: statusType,
          phone_number: phoneNumber,
          expires_at: expiresAt.toISOString(),
          verified: false
        });
        
      if (insertError) {
        console.error("Error creating OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create OTP", details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // Construct the SMS API URL
    const serviceType = statusType === "start" ? "START" : "COMPLETION";
    const smsText = `Dear ${booking.name || "User"}
OTP for the WMS platform is ${otp} and valid for 10 minutes. Please do not share this OTP.
Team
Sampurna (STEP)`;
    
    const smsUrl = new URL("http://www.universalsmsadvertising.com/universalsmsapi.php");
    smsUrl.searchParams.append("user_name", smsApiUsername);
    smsUrl.searchParams.append("user_password", smsApiPassword);
    smsUrl.searchParams.append("mobile", phoneNumber);
    smsUrl.searchParams.append("sender_id", smsApiSenderId);
    smsUrl.searchParams.append("text", smsText);
    
    // Send SMS with OTP
    console.log(`Sending SMS to ${phoneNumber} with URL: ${smsUrl.toString()}`);
    try {
      const smsResponse = await fetch(smsUrl.toString());
      const smsResponseText = await smsResponse.text();
      console.log(`SMS API Response: ${smsResponseText}`);
      
      if (!smsResponse.ok) {
        console.error(`SMS API error: ${smsResponseText}`);
        return new Response(
          JSON.stringify({ error: "Failed to send SMS", apiResponse: smsResponseText }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (smsError) {
      console.error("Error sending SMS:", smsError);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "OTP sent successfully",
        bookingId,
        customerName: booking.name,
        phoneNumber: booking.Phone_no,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing OTP request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

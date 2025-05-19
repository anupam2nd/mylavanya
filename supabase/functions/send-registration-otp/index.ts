
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
    const { phoneNumber } = await req.json();
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
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
    
    // Format the phone number to include country code if not already present
    let formattedPhoneNumber = phoneNumber.toString();
    if (!formattedPhoneNumber.startsWith("91")) {
      formattedPhoneNumber = "91" + formattedPhoneNumber;
    }
    
    // First check if the service_otps table exists, if not create it
    try {
      console.log("Ensuring service_otps table exists by calling create_service_otps_table function");
      
      const { error: createTableError } = await supabase.rpc(
        'create_service_otps_table'
      );
      
      if (createTableError) {
        console.error("Error calling create_service_otps_table function:", createTableError);
      } else {
        console.log("Table check/creation completed successfully");
      }
    } catch (tableError) {
      console.error("Exception when checking/creating table:", tableError);
    }
    
    // Store OTP in database with expiry (10 minutes)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    // Check if there's already an OTP for this phone number
    console.log(`Checking for existing OTP for phone number ${formattedPhoneNumber}`);
    let existingOtp = null;
    try {
      const { data: existingOtps, error: selectError } = await supabase
        .from("service_otps")
        .select("id")
        .eq("phone_number", formattedPhoneNumber)
        .eq("status_type", "registration");
      
      if (selectError) {
        console.error("Error checking existing OTP:", selectError);
      } else if (existingOtps && existingOtps.length > 0) {
        existingOtp = existingOtps[0];
        console.log("Found existing OTP record:", existingOtp.id);
      } else {
        console.log("No existing OTP found, will insert new record");
      }
    } catch (selectError) {
      console.error("Exception when checking existing OTP:", selectError);
    }
    
    if (existingOtp) {
      // Update existing OTP
      console.log(`Updating existing OTP record: ${existingOtp.id}`);
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
      console.log("Successfully updated existing OTP record");
    } else {
      // Create new OTP
      console.log("Creating new OTP record");
      const { error: insertError } = await supabase
        .from("service_otps")
        .insert({
          booking_id: 0, // Use 0 for registration OTPs
          otp_code: otp,
          status_type: "registration",
          phone_number: formattedPhoneNumber,
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
      console.log("Successfully created new OTP record");
    }
    
    // Construct the SMS text
    const smsText = `Dear User
OTP for the WMS platform is ${otp} and valid for 10 minutes. Please do not share this OTP.
Team
Sampurna (STEP)`;
    
    const smsUrl = new URL("http://www.universalsmsadvertising.com/universalsmsapi.php");
    smsUrl.searchParams.append("user_name", smsApiUsername);
    smsUrl.searchParams.append("user_password", smsApiPassword);
    smsUrl.searchParams.append("mobile", formattedPhoneNumber);
    smsUrl.searchParams.append("sender_id", smsApiSenderId);
    smsUrl.searchParams.append("text", smsText);
    
    // Send SMS with OTP
    console.log(`Sending SMS to ${formattedPhoneNumber}`);
    console.log(`SMS API URL parameters: user_name=${smsApiUsername}, mobile=${formattedPhoneNumber}, sender_id=${smsApiSenderId}`);
    
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
        phoneNumber: formattedPhoneNumber,
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

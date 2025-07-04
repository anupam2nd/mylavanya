
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
  console.log('OTP function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { phoneNumber } = requestBody;
    
    if (!phoneNumber) {
      console.error('No phone number provided');
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Processing OTP for phone number:', phoneNumber);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log('Environment check - URL exists:', !!supabaseUrl, 'Service key exists:', !!serviceRoleKey);
    
    // Check SMS API credentials
    const smsApiUsername = Deno.env.get("SMS_API_USER_NAME");
    const smsApiPassword = Deno.env.get("SMS_API_PASSWORD");
    const smsApiSenderId = Deno.env.get("SMS_API_SENDER_ID");
    
    console.log('SMS API credentials check - Username:', !!smsApiUsername, 'Password:', !!smsApiPassword, 'Sender ID:', !!smsApiSenderId);
    
    if (!smsApiUsername || !smsApiPassword || !smsApiSenderId) {
      console.error('SMS API credentials missing');
      return new Response(
        JSON.stringify({ error: "SMS API credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create Supabase client with service role key for admin access
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase credentials missing');
      return new Response(
        JSON.stringify({ error: "Database configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Format the phone number to include country code if not already present
    let formattedPhoneNumber = phoneNumber.toString();
    if (!formattedPhoneNumber.startsWith("91")) {
      formattedPhoneNumber = "91" + formattedPhoneNumber;
    }
    
    console.log('Formatted phone number:', formattedPhoneNumber);
    
    // Store OTP in database with expiry (10 minutes)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    console.log('Attempting to store OTP in database...');
    
    // Check if there's already an OTP for this phone number
    const { data: existingOtps, error: selectError } = await supabase
      .from("service_otps")
      .select("id")
      .eq("phone_number", formattedPhoneNumber)
      .eq("status_type", "registration");
    
    if (selectError) {
      console.error('Error checking existing OTPs:', selectError);
      return new Response(
        JSON.stringify({ error: "Database error while checking existing OTPs", details: selectError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log('Existing OTPs found:', existingOtps?.length || 0);
    
    let dbOperation;
    if (existingOtps && existingOtps.length > 0) {
      // Update existing OTP
      console.log('Updating existing OTP...');
      dbOperation = await supabase
        .from("service_otps")
        .update({
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          verified: false,
          created_at: now.toISOString()
        })
        .eq("id", existingOtps[0].id);
    } else {
      // Create new OTP
      console.log('Creating new OTP record...');
      dbOperation = await supabase
        .from("service_otps")
        .insert({
          booking_id: 0, // Use 0 for registration OTPs
          otp_code: otp,
          status_type: "registration",
          phone_number: formattedPhoneNumber,
          expires_at: expiresAt.toISOString(),
          verified: false
        });
    }
    
    if (dbOperation.error) {
      console.error('Database operation failed:', dbOperation.error);
      return new Response(
        JSON.stringify({ error: "Failed to store OTP in database", details: dbOperation.error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log('OTP stored in database successfully');
    
    // Construct the SMS text
    const smsText = `Dear User
OTP for the WMS platform is ${otp} and valid for 10 minutes. Please do not share this OTP.
Team
Sampurna (STEP)`;
    
    console.log('Preparing to send SMS...');
    
    const smsUrl = new URL("http://www.universalsmsadvertising.com/universalsmsapi.php");
    smsUrl.searchParams.append("user_name", smsApiUsername);
    smsUrl.searchParams.append("user_password", smsApiPassword);
    smsUrl.searchParams.append("mobile", formattedPhoneNumber);
    smsUrl.searchParams.append("sender_id", smsApiSenderId);
    smsUrl.searchParams.append("text", smsText);
    
    console.log('SMS URL constructed:', smsUrl.toString().replace(smsApiPassword, '***'));
    
    // Send SMS with OTP
    try {
      console.log('Sending SMS request...');
      const smsResponse = await fetch(smsUrl.toString());
      const smsResponseText = await smsResponse.text();
      
      console.log('SMS API response status:', smsResponse.status);
      console.log('SMS API response:', smsResponseText);
      
      if (!smsResponse.ok) {
        console.error('SMS API returned error status:', smsResponse.status);
        return new Response(
          JSON.stringify({ 
            error: "Failed to send SMS", 
            apiResponse: smsResponseText,
            status: smsResponse.status 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Check if the SMS API response indicates success
      if (smsResponseText.toLowerCase().includes('error') || smsResponseText.toLowerCase().includes('fail')) {
        console.error('SMS API indicated failure:', smsResponseText);
        return new Response(
          JSON.stringify({ 
            error: "SMS sending failed", 
            apiResponse: smsResponseText 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      console.log('SMS sent successfully');
      
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Return success response
    console.log('OTP process completed successfully');
    return new Response(
      JSON.stringify({ 
        message: "OTP sent successfully",
        phoneNumber: formattedPhoneNumber,
        success: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Unexpected error in OTP function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

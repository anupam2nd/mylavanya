
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
    
    // Store OTP in database with expiry (10 minutes)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    // Check if there's already an OTP for this booking and status type
    const { data: existingOtp } = await supabase
      .from("service_otps")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("status_type", statusType)
      .single();
    
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
          JSON.stringify({ error: "Failed to update OTP" }),
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
          phone_number: booking.Phone_no.toString(),
          expires_at: expiresAt.toISOString()
        });
        
      if (insertError) {
        console.error("Error creating OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create OTP" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // In a real implementation, you would send the OTP via SMS here
    // For now, let's log it and return it in the response (for testing purposes)
    console.log(`OTP for booking ${bookingId} (${statusType}): ${otp}`);
    console.log(`Would send OTP to phone: ${booking.Phone_no}`);
    
    // In a production environment, you would use an SMS service like Twilio, but for now
    // we'll just return the OTP in the response for testing purposes
    return new Response(
      JSON.stringify({ 
        message: "OTP generated successfully",
        otp: otp, // Remove this in production
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
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

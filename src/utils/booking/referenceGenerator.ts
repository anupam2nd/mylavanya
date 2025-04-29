
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Function to generate booking reference number
export const generateBookingReference = async (): Promise<string> => {
  // Format: YYMM + 4 digit running number using current date (not booking date)
  const currentDate = new Date();
  const yearMonth = format(currentDate, "yyMM"); // Get YYMM part
  
  try {
    // Get the latest booking with this year-month prefix
    const { data, error } = await supabase
      .from("BookMST")
      .select("Booking_NO")
      .like("Booking_NO", `${yearMonth}%`)
      .order("Booking_NO", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching latest booking:", error);
      throw error;
    }
    
    let runningNumber = 0;
    
    // If there are existing bookings with this prefix, increment the last one
    if (data && data.length > 0 && data[0].Booking_NO) {
      // Convert to string to safely use substring
      const lastRef = String(data[0].Booking_NO);
      
      // Extract the numeric part (last 4 digits)
      const lastDigits = lastRef.substring(4);
      const lastNumber = parseInt(lastDigits, 10);
      
      // If parsed correctly, increment; otherwise start from 0
      runningNumber = isNaN(lastNumber) ? 0 : lastNumber + 1;
      console.log(`Last booking reference: ${lastRef}, extracted number: ${lastNumber}, new number: ${runningNumber}`);
    } else {
      // No existing bookings for this year-month, start from 0
      console.log(`No existing bookings for ${yearMonth}, starting from 0`);
    }
    
    // Format running number as 4 digits with leading zeros
    const formattedNumber = runningNumber.toString().padStart(4, '0');
    const newReference = `${yearMonth}${formattedNumber}`;
    console.log(`Generated new booking reference: ${newReference}`);
    
    return newReference;
  } catch (error) {
    console.error("Error generating booking reference:", error);
    // Fallback to timestamp-based reference if database query fails
    const fallbackYearMonth = format(new Date(), "yyMM");
    return `${fallbackYearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
};

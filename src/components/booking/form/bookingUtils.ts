
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Helper function to standardize logging
const log = (operation: string, message: string, data?: any) => {
  console.log(`[Booking ${operation}] ${message}`, data ? data : '');
};

// Generate a unique booking reference based on date and sequence
export const generateBookingReference = async (): Promise<string> => {
  const currentDate = new Date();
  const yearMonth = format(currentDate, "yyMM");

  try {
    log("Reference", `Generating booking reference for yearMonth: ${yearMonth}`);
    
    // Query the last booking reference with this year/month prefix
    const { data } = await supabase
      .from("BookMST")
      .select("Booking_NO")
      .like("Booking_NO", `${yearMonth}%`)
      .order("Booking_NO", { ascending: false })
      .limit(1);

    log("Reference", "Last booking reference data:", data);
    
    // Calculate the next sequence number
    let runningNumber = 1;
    if (data && data.length > 0 && data[0].Booking_NO) {
      const lastRef = data[0].Booking_NO.toString(); // Ensure it's a string
      // Extract the sequence number portion
      const lastNumber = parseInt(lastRef.substring(4), 10);
      runningNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    // Format the reference with padded zeros
    const formattedNumber = runningNumber.toString().padStart(4, '0');
    const bookingRef = `${yearMonth}${formattedNumber}`;
    
    log("Reference", `Generated booking reference: ${bookingRef}`);
    return bookingRef;
  } catch (error) {
    log("Reference Error", "Error generating booking reference:", error);
    
    // Fallback to a random number if the query fails
    const fallbackYearMonth = format(new Date(), "yyMM");
    const fallbackRef = `${fallbackYearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    log("Reference", `Using fallback reference: ${fallbackRef}`);
    return fallbackRef;
  }
};

// Convert time formats consistently to 24-hour format for database storage
export const convertTo24HourFormat = (time12h: string): string => {
  log("Time Conversion", `Converting time input: ${time12h}`);

  // If already in 24-hour format (HH:MM), return as is
  if (time12h.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    log("Time Conversion", `Already in 24-hour format: ${time12h}`);
    return time12h;
  }

  try {
    // Handle AM/PM format
    let timeParts = time12h.split(' ');
    
    // If there's no space (like "3:00PM"), add a space for consistent parsing
    if (timeParts.length === 1) {
      // Find where AM/PM starts
      const ampmMatch = time12h.match(/(am|pm|AM|PM)$/i);
      if (ampmMatch) {
        const index = ampmMatch.index;
        if (index !== undefined) {
          time12h = time12h.slice(0, index) + ' ' + time12h.slice(index);
          timeParts = time12h.split(' ');
        }
      }
    }
    
    const [timePart, period] = timeParts;

    if (!timePart || !period) {
      log("Time Conversion Error", `Invalid time format (missing parts): ${time12h}`);
      return "09:00"; // Default to 9 AM if parsing fails
    }

    const [hoursStr, minutesStr] = timePart.split(':');

    if (!hoursStr || !minutesStr) {
      log("Time Conversion Error", `Invalid time format (missing hours/minutes): ${time12h}`);
      return "09:00"; // Default to 9 AM if parsing fails
    }

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      log("Time Conversion Error", `Invalid time values: ${hours}:${minutes}`);
      return "09:00";
    }

    // Convert 12-hour format to 24-hour
    const upperPeriod = period.toUpperCase();
    if (upperPeriod.includes('PM') && hours < 12) {
      hours += 12;
    } else if (upperPeriod.includes('AM') && hours === 12) {
      hours = 0;
    }

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    log("Time Conversion", `Converted time: ${time12h} → ${formattedTime}`);
    return formattedTime;
  } catch (error) {
    log("Time Conversion Error", "Error parsing time:", error);
    return "09:00"; // Default to 9 AM if parsing fails
  }
};

// Convert time from 24-hour to 12-hour format for display
export const convertTo12HourFormat = (time24h: string): string => {
  try {
    const [hoursStr, minutesStr] = time24h.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time24h; // Return original if parsing fails
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12
    
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return time24h; // Return original if parsing fails
  }
};

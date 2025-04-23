
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const generateBookingReference = async (): Promise<string> => {
  const currentDate = new Date();
  const yearMonth = format(currentDate, "yyMM");

  try {
    const { data } = await supabase
      .from("BookMST")
      .select("Booking_NO")
      .like("Booking_NO", `${yearMonth}%`)
      .order("Booking_NO", { ascending: false })
      .limit(1);

    let runningNumber = 1;

    if (data && data.length > 0 && data[0].Booking_NO) {
      const lastRef = data[0].Booking_NO;
      const lastNumber = parseInt(lastRef.substring(4), 10);
      runningNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    const formattedNumber = runningNumber.toString().padStart(4, '0');
    return `${yearMonth}${formattedNumber}`;
  } catch (error) {
    console.error("Error generating booking reference:", error);
    const fallbackYearMonth = format(new Date(), "yyMM");
    return `${fallbackYearMonth}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
};

// Converts 12-hour or 24-hour string to 24-hour HH:MM format
export const convertTo24HourFormat = (time12h: string): string => {
  console.log("Converting time input:", time12h);

  // If already in 24-hour format (HH:MM), return as is
  if (time12h.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    console.log("Time already in 24-hour format:", time12h);
    return time12h;
  }

  try {
    // Handle AM/PM format
    const [timePart, period] = time12h.split(' ');

    if (!timePart || !period) {
      console.error("Invalid time format (missing parts):", time12h);
      return "09:00"; // Default to 9 AM if parsing fails
    }

    const [hoursStr, minutesStr] = timePart.split(':');

    if (!hoursStr || !minutesStr) {
      console.error("Invalid time format (missing hours/minutes):", time12h);
      return "09:00"; // Default to 9 AM if parsing fails
    }

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time values:", { hours, minutes });
      return "09:00";
    }

    // Convert 12-hour format to 24-hour
    if (period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log("Converted time:", formattedTime);
    return formattedTime;
  } catch (error) {
    console.error("Error parsing time:", error);
    return "09:00"; // Default to 9 AM if parsing fails
  }
};

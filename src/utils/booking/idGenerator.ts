
import { supabase } from "@/integrations/supabase/client";

// Function to get the next available ID
export const getNextAvailableId = async (): Promise<number> => {
  try {
    // Get the maximum ID value currently in the table
    const { data, error } = await supabase
      .from("BookMST")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error getting max ID:", error);
      throw error;
    }
    
    // Return max ID + 1 or start with 1 if no records exist
    return data && data.length > 0 ? Number(data[0].id) + 1 : 1;
  } catch (error) {
    console.error("Error determining next ID:", error);
    throw error;
  }
};

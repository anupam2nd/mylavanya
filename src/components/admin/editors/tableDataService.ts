
import { supabase } from "@/integrations/supabase/client";

// Define valid table names explicitly
export type TableName = "BookMST" | "PriceMST" | "statusmst" | "UserMST";

export const fetchRecordById = async (
  tableName: TableName, 
  recordId: number
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${tableName} record:`, error);
    throw error;
  }
};

export const updateRecord = async (
  tableName: TableName, 
  recordId: number, 
  submissionData: Record<string, unknown>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .update(submissionData)
      .eq('id', recordId);
        
    if (error) throw error;
  } catch (updateError) {
    console.error('Update failed:', updateError);
    throw updateError;
  }
};

export const insertRecord = async (
  tableName: TableName, 
  submissionData: Record<string, unknown>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .insert(submissionData);
        
    if (error) throw error;
  } catch (insertError) {
    console.error('Insert failed:', insertError);
    throw insertError;
  }
};

// Add archive function for BookMST
export const archiveRecord = async (
  tableName: TableName, 
  recordId: number
): Promise<void> => {
  try {
    // For BookMST, set Status to 'archived'
    if (tableName === 'BookMST') {
      const { error } = await supabase
        .from(tableName)
        .update({ Status: 'archived' })
        .eq('id', recordId);
          
      if (error) throw error;
    } else {
      // For other tables, deactivate them by setting active to false if column exists
      const { error } = await supabase
        .from(tableName)
        .update({ active: false })
        .eq('id', recordId);
          
      if (error) throw error;
    }
  } catch (archiveError) {
    console.error('Archive/Deactivate failed:', archiveError);
    throw archiveError;
  }
};

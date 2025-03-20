
import { supabase } from "@/integrations/supabase/client";

// Define valid table names explicitly to avoid recursive type issues
export type TableName = "BookMST" | "PriceMST" | "statusmst" | "UserMST";

// Use Record<string, any> for a generic table record type
export type TableRecord = Record<string, any>;

// Simplify the return type to avoid excessive type instantiation
export const fetchRecordById = async (
  tableName: TableName, 
  recordId: number
): Promise<TableRecord | null> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) throw error;
    return data as TableRecord;
  } catch (error) {
    console.error(`Error fetching ${tableName} record:`, error);
    throw error;
  }
};

export const updateRecord = async (tableName: TableName, recordId: number, submissionData: any) => {
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

export const insertRecord = async (tableName: TableName, submissionData: any) => {
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


import { supabase } from "@/integrations/supabase/client";

// Define valid table names explicitly to avoid recursive type issues
export type TableName = "BookMST" | "PriceMST" | "statusmst" | "UserMST";

// Type for query response to avoid type instantiation depth issues
type QueryResponse = {
  data: any;
  error: any;
};

export const fetchRecordById = async <T = any>(
  tableName: TableName, 
  recordId: number
): Promise<T | null> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) throw error;
    return data as T | null;
  } catch (error) {
    console.error(`Error fetching ${tableName} record:`, error);
    throw error;
  }
};

// export const fetchRecordById = async (tableName: TableName, recordId: number) => {
//   try {
//     const response: QueryResponse = await supabase
//       .from(tableName)
//       .select('*')
//       .eq('id', recordId)
//       .single();
    
//     if (response.error) throw response.error;
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching ${tableName} record:`, error);
//     throw error;
//   }
// };

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

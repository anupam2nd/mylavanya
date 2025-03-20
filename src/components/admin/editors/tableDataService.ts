
import { supabase } from "@/integrations/supabase/client";

// Define valid table names explicitly to avoid recursive type issues
export type TableName = "BookMST" | "PriceMST" | "statusmst" | "UserMST";

export const fetchRecordById = async (tableName: TableName, recordId: number) => {
  try {
    // const { data, error } = await supabase
    //   .from(tableName)
    //   .select('*')
    //   .eq('id', recordId)
    //   .single();
      
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', recordId)
          .single() as unknown as any;
    
    if (error) throw error;
    return data;
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

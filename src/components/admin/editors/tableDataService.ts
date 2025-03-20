
import { supabase } from "@/integrations/supabase/client";
import { GenericTable } from "./types";

// Define valid table names type based on Supabase database schema
type TableName = "BookMST" | "PriceMST" | "statusmst" | "UserMST";

export const fetchRecordById = async (tableName: string, recordId: number) => {
  try {
    // Use rpc to get around TypeScript limitations for dynamic table names
    const { data, error } = await supabase
      .rpc('get_record_by_id', { 
        p_table_name: tableName,
        p_record_id: recordId
      })
      .single();
      
    if (error) {
      // Fallback to direct query if RPC doesn't exist
      const { data: directData, error: directError } = await supabase
        .from(tableName as TableName)
        .select('*')
        .eq('id', recordId)
        .single();
        
      if (directError) throw directError;
      return directData;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${tableName} record:`, error);
    throw error;
  }
};

export const updateRecord = async (tableName: string, recordId: number, submissionData: any) => {
  try {
    // Try RPC first
    const { error } = await supabase.rpc('update_record', {
      p_table_name: tableName,
      p_record_id: recordId,
      p_record_data: submissionData
    });
    
    if (error) {
      // Fall back to direct query if RPC doesn't exist
      const { error: directError } = await supabase
        .from(tableName as TableName)
        .update(submissionData)
        .eq('id', recordId);
        
      if (directError) throw directError;
    }
  } catch (updateError) {
    console.error('Update failed:', updateError);
    throw updateError;
  }
};

export const insertRecord = async (tableName: string, submissionData: any) => {
  try {
    // Try RPC first
    const { error } = await supabase.rpc('insert_record', {
      p_table_name: tableName,
      p_record_data: submissionData
    });
    
    if (error) {
      // Fall back to direct query if RPC doesn't exist
      const { error: directError } = await supabase
        .from(tableName as TableName)
        .insert(submissionData);
        
      if (directError) throw directError;
    }
  } catch (insertError) {
    console.error('Insert failed:', insertError);
    throw insertError;
  }
};

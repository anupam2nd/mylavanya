
import { supabase } from "@/integrations/supabase/client";
import { isValidTableName } from "../utils/tableValidation";
import { TableName } from "@/components/admin/editors/tableDataService";

// Fetch available tables from the database
export const fetchDatabaseTables = async () => {
  try {
    // Manually return the list of valid tables
    return ["BookMST", "PriceMST", "statusmst", "UserMST"];
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Fetch table columns for a specific table
export const fetchTableColumns = async (tableName: string) => {
  if (!tableName) return [];
  
  try {
    if (!isValidTableName(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      throw new Error(`Table "${tableName}" is not accessible`);
    }
    
    // Use typed table name for the query
    const { data, error } = await supabase
      .from(tableName as TableName)
      .select('*')
      .limit(0);
      
    if (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      throw new Error(`Could not fetch columns for ${tableName}`);
    }
    
    // Derive columns from the returned object structure
    if (data) {
      // If no data returned, try to get columns through reflection API
      const reflection = await supabase.rpc('get_table_columns', { 
        p_table_name: tableName 
      });
      
      if (reflection.data && reflection.data.length > 0) {
        return reflection.data;
      }
      
      // Fall back to extracting from sample data
      return data.length > 0 
        ? Object.keys(data[0]).map(column_name => ({
            column_name,
            data_type: typeof data[0][column_name],
            is_nullable: 'YES'
          }))
        : [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching columns for ${tableName}:`, error);
    throw error;
  }
};

// Fetch records from a specific table
export const fetchTableRecords = async (tableName: string) => {
  if (!tableName) return [];
  
  try {
    if (!isValidTableName(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    // Use validated table name
    const { data, error } = await supabase
      .from(tableName as TableName)
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching records from ${tableName}:`, error);
    throw error;
  }
};

// Delete a record from a specific table
export const deleteTableRecord = async (tableName: string, recordId: number) => {
  if (!tableName) return false;

  try {
    if (!isValidTableName(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return false;
    }
    
    // Use validated table name
    const { error } = await supabase
      .from(tableName as TableName)
      .delete()
      .eq('id', recordId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    return false;
  }
};

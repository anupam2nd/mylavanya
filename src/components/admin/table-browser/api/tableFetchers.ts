
import { supabase } from "@/integrations/supabase/client";
import { isValidTableName } from "../utils/tableValidation";
import { TableName } from "@/components/admin/editors/tableDataService";

// Fetch available tables from the database
export const fetchDatabaseTables = async () => {
  try {
    // Use a direct SQL query to get table information
    const { data, error } = await supabase.rpc('get_user_tables');

    if (error) {
      // Fallback to raw query if RPC doesn't exist
      const { data: rawData, error: rawError } = await supabase.rpc('get_tables');
      
      if (rawError) {
        console.error('Could not fetch tables:', rawError);
        throw new Error("Could not fetch database tables");
      }
      
      return rawData || [];
    } else {
      return data || [];
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Fetch table columns for a specific table
export const fetchTableColumns = async (tableName: string) => {
  if (!tableName) return [];
  
  try {
    // Get column information using RPC
    const { data, error } = await supabase.rpc('get_table_columns', {
      p_table_name: tableName
    });

    if (error) {
      // Fallback to raw query
      console.error('Could not fetch columns using RPC:', error);
      
      if (!isValidTableName(tableName)) {
        console.error(`Invalid table name: ${tableName}`);
        throw new Error(`Table "${tableName}" is not accessible`);
      }
      
      // Use typed table name for the query
      const { data: columnsData, error: columnsError } = await supabase
        .from(tableName as TableName)
        .select('*')
        .limit(0);
        
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        throw new Error(`Could not fetch columns for ${tableName}`);
      }
      
      // Derive columns from the returned object structure
      if (columnsData) {
        return columnsData.length > 0 
          ? Object.keys(columnsData[0]).map(column_name => ({
              column_name,
              data_type: typeof columnsData[0][column_name],
              is_nullable: 'YES'
            }))
          : [];
      }
      return [];
    } else {
      return data || [];
    }
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


import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTableData = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        // Use a direct SQL query to get table information
        const { data, error } = await supabase.rpc('get_user_tables');

        if (error) {
          // Fallback to raw query if RPC doesn't exist
          const { data: rawData, error: rawError } = await supabase.rpc('get_tables');
          
          if (rawError) {
            console.error('Could not fetch tables:', rawError);
            toast({
              title: "Failed to load tables",
              description: "Could not fetch database tables",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          const userTables = rawData || [];
          setTables(userTables);
          
          // Select first table by default if none selected
          if (userTables.length > 0 && !selectedTable) {
            setSelectedTable(userTables[0]);
          }
        } else {
          // Filter out system tables
          const userTables = data || [];
          setTables(userTables);
          
          // Select first table by default if none selected
          if (userTables.length > 0 && !selectedTable) {
            setSelectedTable(userTables[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Failed to load tables",
          description: "Could not fetch database tables",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [toast, selectedTable]);

  // Fetch table columns when a table is selected
  useEffect(() => {
    const fetchTableColumns = async () => {
      if (!selectedTable) return;
      
      try {
        setLoading(true);
        
        // Get column information using RPC
        const { data, error } = await supabase.rpc('get_table_columns', {
          p_table_name: selectedTable
        });

        if (error) {
          // Fallback to raw query
          console.error('Could not fetch columns using RPC:', error);
          
          // For TypeScript safety, we'll use type assertion with any
          const { data: columnsData, error: columnsError } = await supabase
            .from(selectedTable as any)
            .select('*')
            .limit(0);
            
          if (columnsError) {
            console.error(`Error fetching columns for ${selectedTable}:`, columnsError);
            toast({
              title: "Failed to load table structure",
              description: `Could not fetch columns for ${selectedTable}`,
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          // Derive columns from the returned object structure
          if (columnsData) {
            const derivedColumns = columnsData.length > 0 
              ? Object.keys(columnsData[0]).map(column_name => ({
                  column_name,
                  data_type: typeof columnsData[0][column_name],
                  is_nullable: 'YES'
                }))
              : [];
            setColumns(derivedColumns);
          }
        } else {
          setColumns(data || []);
        }
        
        // Fetch records after getting columns
        await fetchRecords();
      } catch (error) {
        console.error(`Error fetching columns for ${selectedTable}:`, error);
        toast({
          title: "Failed to load table structure",
          description: `Could not fetch columns for ${selectedTable}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTableColumns();
  }, [selectedTable]);

  // Fetch records for the selected table
  const fetchRecords = async () => {
    if (!selectedTable) return;
    
    try {
      setLoading(true);
      
      // Use type assertion to handle dynamic table names
      const { data, error } = await supabase
        .from(selectedTable as any)
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      setRecords(data || []);
    } catch (error) {
      console.error(`Error fetching records from ${selectedTable}:`, error);
      toast({
        title: "Failed to load records",
        description: `Could not fetch data from ${selectedTable}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a record
  const deleteRecord = async (recordId: number) => {
    if (!selectedTable) return;

    try {
      // Use type assertion to handle dynamic table names
      const { error } = await supabase
        .from(selectedTable as any)
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      // Remove the deleted record from the local state
      setRecords(records.filter(record => record.id !== recordId));
      
      toast({
        title: "Record deleted",
        description: "The record has been successfully removed",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the record",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    tables,
    selectedTable,
    setSelectedTable,
    columns,
    records,
    loading,
    fetchRecords,
    deleteRecord
  };
};

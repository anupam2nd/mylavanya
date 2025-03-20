
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchDatabaseTables, 
  fetchTableColumns, 
  fetchTableRecords,
  deleteTableRecord 
} from "./api/tableFetchers";
import { isValidTableName } from "./utils/tableValidation";

export const useTableData = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available tables
  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const userTables = await fetchDatabaseTables();
        
        setTables(userTables);
        
        // Select first table by default if none selected
        if (userTables.length > 0 && !selectedTable) {
          setSelectedTable(userTables[0]);
        }
      } catch (error) {
        toast({
          title: "Failed to load tables",
          description: "Could not fetch database tables",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [toast, selectedTable]);

  // Fetch table columns when a table is selected
  useEffect(() => {
    const loadTableColumns = async () => {
      if (!selectedTable) return;
      
      try {
        setLoading(true);
        
        const columnsData = await fetchTableColumns(selectedTable);
        setColumns(columnsData);
        
        // Fetch records after getting columns
        await fetchRecords();
      } catch (error: any) {
        toast({
          title: "Failed to load table structure",
          description: error.message || `Could not fetch columns for ${selectedTable}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTableColumns();
  }, [selectedTable]);

  // Fetch records for the selected table
  const fetchRecords = async () => {
    if (!selectedTable) return;
    
    try {
      setLoading(true);
      
      const tableRecords = await fetchTableRecords(selectedTable);
      setRecords(tableRecords);
    } catch (error) {
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
    if (!selectedTable) return false;

    try {
      const success = await deleteTableRecord(selectedTable, recordId);
      
      if (success) {
        // Remove the deleted record from the local state
        setRecords(records.filter(record => record.id !== recordId));
        
        toast({
          title: "Record deleted",
          description: "The record has been successfully removed",
        });
      } else {
        throw new Error("Deletion failed");
      }
      
      return success;
    } catch (error) {
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

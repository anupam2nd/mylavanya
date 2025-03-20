
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TableEditor from "@/components/admin/TableEditor";

const TableBrowser = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        // Get list of tables from Supabase
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (error) throw error;
        
        // Filter out system tables
        const userTables = data
          ?.map(t => t.table_name)
          .filter(name => !name.startsWith('_'))
          .sort() || [];
          
        setTables(userTables);
        
        // Select first table by default if none selected
        if (userTables.length > 0 && !selectedTable) {
          setSelectedTable(userTables[0]);
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
        
        // Get column information
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', selectedTable);

        if (error) throw error;
        
        setColumns(data || []);
        
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
  }, [selectedTable, toast]);

  // Fetch records for the selected table
  const fetchRecords = async () => {
    if (!selectedTable) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(selectedTable)
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

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setRecords([]);
    setColumns([]);
  };

  const handleRefresh = () => {
    fetchRecords();
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedRecord(null);
    setOpenDialog(true);
  };

  const handleEdit = (recordId: number) => {
    setIsAddingNew(false);
    setSelectedRecord(recordId);
    setOpenDialog(true);
  };

  const handleDelete = (recordId: number) => {
    setRecordToDelete(recordId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete === null || !selectedTable) return;

    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', recordToDelete);

      if (error) throw error;

      setRecords(records.filter(record => record.id !== recordToDelete));
      toast({
        title: "Record deleted",
        description: "The record has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the record",
        variant: "destructive"
      });
    }
  };

  // Create column definitions for the TableEditor component
  const getColumnDefinitions = () => {
    return columns.map(col => {
      const colName = col.column_name;
      // Skip id column for editing
      if (colName === 'id') return null;
      
      // Determine field type based on the PostgreSQL data type
      let fieldType: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' = 'text';
      
      if (col.data_type.includes('int') || col.data_type === 'numeric') {
        fieldType = 'number';
      } else if (col.data_type === 'boolean') {
        fieldType = 'boolean';
      } else if (col.data_type.includes('text')) {
        fieldType = 'textarea';
      } else if (col.data_type.includes('date')) {
        fieldType = 'date';
      }
      
      return {
        name: colName,
        type: fieldType,
        required: col.is_nullable === 'NO'
      };
    }).filter(Boolean) as any[];
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Table Browser">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Database Table Browser</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedTable}
                onValueChange={handleTableChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} disabled={!selectedTable}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
              {selectedTable && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" /> Add Record
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : selectedTable ? (
              records.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col.column_name}>
                            {col.column_name}
                          </TableHead>
                        ))}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          {columns.map((col) => (
                            <TableCell key={`${record.id}-${col.column_name}`}>
                              {renderTableCell(record[col.column_name], col.data_type)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(record.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No records found in {selectedTable}. Add a record to get started.
                </p>
              )
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Select a table to view and manage records.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Table Editor Dialog */}
        {selectedTable && (
          <TableEditor
            tableName={selectedTable}
            recordId={selectedRecord}
            columns={getColumnDefinitions()}
            open={openDialog}
            onOpenChange={setOpenDialog}
            onSaveSuccess={fetchRecords}
            title={isAddingNew ? `Add New ${selectedTable} Record` : `Edit ${selectedTable} Record`}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                record from the {selectedTable} table.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

// Helper function to render cell content based on data type
const renderTableCell = (value: any, dataType: string) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">NULL</span>;
  }
  
  if (dataType === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (dataType.includes('timestamp') || dataType.includes('date')) {
    try {
      return new Date(value).toLocaleString();
    } catch (e) {
      return value;
    }
  }
  
  // Handle long text
  if (typeof value === 'string' && value.length > 100) {
    return `${value.substring(0, 100)}...`;
  }
  
  // Handle objects/arrays
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value;
};

export default TableBrowser;

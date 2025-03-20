
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TableEditor from "@/components/admin/TableEditor";
import TableActions from "@/components/admin/table-browser/TableActions";
import RecordsTable from "@/components/admin/table-browser/RecordsTable";
import DeleteRecordDialog from "@/components/admin/table-browser/DeleteRecordDialog";
import { useTableData } from "@/components/admin/table-browser/useTableData";
import { useColumnDefinitions } from "@/components/admin/table-browser/useColumnDefinitions";
import { TableName } from "@/components/admin/editors/tableDataService";

const TableBrowser = () => {
  // State for the editor dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // Use our new hooks
  const {
    tables,
    selectedTable,
    setSelectedTable,
    columns,
    records,
    loading,
    fetchRecords,
    deleteRecord
  } = useTableData();
  
  const columnDefinitions = useColumnDefinitions(columns);

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
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
    if (recordToDelete === null) return;
    
    const success = await deleteRecord(recordToDelete);
    if (success) {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Table Browser">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Database Table Browser</CardTitle>
            <TableActions
              selectedTable={selectedTable}
              tables={tables}
              onTableChange={handleTableChange}
              onRefresh={handleRefresh}
              onAddNew={handleAddNew}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : selectedTable ? (
              records.length > 0 ? (
                <RecordsTable
                  columns={columns}
                  records={records}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
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
            tableName={selectedTable as TableName}
            recordId={selectedRecord}
            columns={columnDefinitions}
            open={openDialog}
            onOpenChange={setOpenDialog}
            onSaveSuccess={fetchRecords}
            title={isAddingNew ? `Add New ${selectedTable} Record` : `Edit ${selectedTable} Record`}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteRecordDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          tableName={selectedTable}
          onConfirm={confirmDelete}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TableBrowser;

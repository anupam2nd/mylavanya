
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableActionsProps {
  selectedTable: string;
  tables: string[];
  onTableChange: (table: string) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  selectedTable,
  tables,
  onTableChange,
  onRefresh,
  onAddNew,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedTable}
        onValueChange={onTableChange}
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
      <Button variant="outline" onClick={onRefresh} disabled={!selectedTable}>
        <RefreshCcw className="h-4 w-4" />
      </Button>
      {selectedTable && (
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      )}
    </div>
  );
};

export default TableActions;

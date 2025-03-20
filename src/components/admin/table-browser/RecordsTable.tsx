
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableCellRenderer from "./TableCellRenderer";
import RecordActions from "./RecordActions";

interface RecordsTableProps {
  columns: any[];
  records: any[];
  onEdit: (recordId: number) => void;
  onDelete: (recordId: number) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({
  columns,
  records,
  onEdit,
  onDelete,
}) => {
  return (
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
                  <TableCellRenderer value={record[col.column_name]} dataType={col.data_type} />
                </TableCell>
              ))}
              <TableCell className="text-right">
                <RecordActions 
                  recordId={record.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;

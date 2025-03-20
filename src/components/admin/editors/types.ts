
import { TableName } from "./tableDataService";

export interface TableColumnDefinition {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface TableEditorProps {
  tableName: string | TableName;
  recordId: number | null;
  columns: TableColumnDefinition[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
  title?: string;
}

// Type for generic table operations
export type GenericTable = {
  [key: string]: any;
};

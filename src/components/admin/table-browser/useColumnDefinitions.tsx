
import { useMemo } from "react";
import { TableColumnDefinition } from "@/components/admin/TableEditor";

export const useColumnDefinitions = (columns: any[]) => {
  const columnDefinitions = useMemo(() => {
    return columns.map(col => {
      const colName = col.column_name;
      // Skip id column for editing
      if (colName === 'id') return null;
      
      // Determine field type based on the PostgreSQL data type
      let fieldType: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' = 'text';
      
      if (col.data_type && (col.data_type.includes('int') || col.data_type === 'numeric')) {
        fieldType = 'number';
      } else if (col.data_type === 'boolean') {
        fieldType = 'boolean';
      } else if (col.data_type && col.data_type.includes('text')) {
        fieldType = 'textarea';
      } else if (col.data_type && col.data_type.includes('date')) {
        fieldType = 'date';
      }
      
      return {
        name: colName,
        type: fieldType,
        required: col.is_nullable === 'NO'
      };
    }).filter(Boolean) as TableColumnDefinition[];
  }, [columns]);

  return columnDefinitions;
};

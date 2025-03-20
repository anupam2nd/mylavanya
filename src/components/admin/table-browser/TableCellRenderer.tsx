
import React from "react";

interface TableCellRendererProps {
  value: any;
  dataType: string;
}

const TableCellRenderer: React.FC<TableCellRendererProps> = ({ value, dataType }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">NULL</span>;
  }
  
  if (dataType === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (dataType && (dataType.includes('timestamp') || dataType.includes('date'))) {
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

export default TableCellRenderer;

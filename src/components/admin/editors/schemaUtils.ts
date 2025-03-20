
import { z } from "zod";
import { TableColumnDefinition } from "./types";

export const createDynamicSchema = (columns: TableColumnDefinition[]) => {
  const schemaObj: { [key: string]: any } = {};
  
  columns.forEach((column) => {
    let fieldSchema;
    
    switch (column.type) {
      case 'text':
        fieldSchema = column.required 
          ? z.string().min(1, `${column.name} is required`)
          : z.string().nullable();
        break;
      case 'textarea':
        fieldSchema = column.required 
          ? z.string().min(1, `${column.name} is required`)
          : z.string().nullable();
        break;
      case 'number':
        fieldSchema = column.required 
          ? z.number().or(z.string().regex(/^\d+$/).transform(Number))
          : z.number().nullable().or(z.string().regex(/^\d*$/).transform(val => val === '' ? null : Number(val)));
        break;
      case 'boolean':
        fieldSchema = z.boolean().optional();
        break;
      case 'date':
        fieldSchema = column.required 
          ? z.date()
          : z.date().nullable();
        break;
      case 'select':
        fieldSchema = column.required 
          ? z.string().min(1, `${column.name} is required`)
          : z.string().nullable();
        break;
      default:
        fieldSchema = z.any();
    }
    
    schemaObj[column.name] = fieldSchema;
  });
  
  return z.object(schemaObj);
};

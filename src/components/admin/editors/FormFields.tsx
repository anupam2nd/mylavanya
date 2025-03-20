
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableColumnDefinition } from "./types";

interface FormFieldProps {
  column: TableColumnDefinition;
  field: any;
}

export const FormFieldInput: React.FC<FormFieldProps> = ({ column, field }) => {
  const renderInputByType = (column: TableColumnDefinition, field: any) => {
    switch (column.type) {
      case 'textarea':
        return (
          <Textarea
            {...field}
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
          />
        );
      case 'boolean':
        return (
          <Select
            value={field.value?.toString() || ""}
            onValueChange={(value) => field.onChange(value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'select':
        return (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${column.name}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            {...field}
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
        );
      default:
        return (
          <Input
            type="text"
            {...field}
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <FormItem className="grid grid-cols-4 items-center gap-4">
      <FormLabel className="text-right">{column.name}</FormLabel>
      <div className="col-span-3">
        <FormControl>
          {renderInputByType(column, field)}
        </FormControl>
        <FormMessage />
      </div>
    </FormItem>
  );
};

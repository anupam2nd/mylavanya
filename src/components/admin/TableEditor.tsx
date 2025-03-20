
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

interface TableColumnDefinition {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface TableEditorProps {
  tableName: string;
  recordId: number | null;
  columns: TableColumnDefinition[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
  title?: string;
}

const TableEditor: React.FC<TableEditorProps> = ({
  tableName,
  recordId,
  columns,
  open,
  onOpenChange,
  onSaveSuccess,
  title = "Edit Record"
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Dynamically create a zod schema based on the columns
  const createDynamicSchema = () => {
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

  const dynamicSchema = createDynamicSchema();
  type FormValues = z.infer<typeof dynamicSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {},
  });

  // Fetch record data if editing an existing record
  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        // For new records, just reset the form
        form.reset({});
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', recordId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Transform data to match form fields
          const formData: any = {};
          
          columns.forEach((column) => {
            if (column.name in data) {
              formData[column.name] = data[column.name];
            }
          });
          
          form.reset(formData);
        }
      } catch (error) {
        console.error(`Error fetching ${tableName} record:`, error);
        toast({
          title: "Failed to load record",
          description: "Could not fetch the requested record",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchRecord();
    }
  }, [open, recordId, tableName, form, toast, columns]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // Clean up values for submission
      const submissionData: any = { ...values };
      
      // Process the insert or update
      if (recordId) {
        // Update existing record
        const { error } = await supabase
          .from(tableName)
          .update(submissionData)
          .eq('id', recordId);
          
        if (error) throw error;
        
        toast({
          title: "Record updated",
          description: "The record has been successfully updated",
        });
      } else {
        // Create new record
        const { error } = await supabase
          .from(tableName)
          .insert([submissionData]);
          
        if (error) throw error;
        
        toast({
          title: "Record created",
          description: "The new record has been successfully created",
        });
      }
      
      onSaveSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving ${tableName} record:`, error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (column: TableColumnDefinition) => {
    return (
      <FormField
        key={column.name}
        control={form.control}
        name={column.name as any}
        render={({ field }) => (
          <FormItem className="grid grid-cols-4 items-center gap-4">
            <FormLabel className="text-right">{column.name}</FormLabel>
            <div className="col-span-3">
              <FormControl>
                {renderInputByType(column, field)}
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    );
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {recordId ? "Edit this record's details." : "Create a new record."}
          </DialogDescription>
        </DialogHeader>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {!loading && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {columns.map((column) => renderFormField(column))}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {recordId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableEditor;

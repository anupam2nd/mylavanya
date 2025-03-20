
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
  FormField,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { FormFieldInput } from "./FormFields";
import { createDynamicSchema } from "./schemaUtils";
import { fetchRecordById, updateRecord, insertRecord, TableName, TableRecord } from "./tableDataService";
import { TableEditorProps } from "./types";
import { z } from "zod";

const TableEditorDialog: React.FC<TableEditorProps> = ({
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
  
  const dynamicSchema = createDynamicSchema(columns);
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
        // Type assertion needed for tableName
        const data = await fetchRecordById(tableName as TableName, recordId);
        
        if (data) {
          // Transform data to match form fields
          const formData: Record<string, any> = {};
          
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
      
      // Process the insert or update using RPC or direct query with type casting
      if (recordId) {
        // Update existing record
        await updateRecord(tableName as TableName, recordId, submissionData);
        
        toast({
          title: "Record updated",
          description: "The record has been successfully updated",
        });
      } else {
        // Create new record
        await insertRecord(tableName as TableName, submissionData);
        
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
                {columns.map((column) => (
                  <FormField
                    key={column.name}
                    control={form.control}
                    name={column.name as any}
                    render={({ field }) => (
                      <FormFieldInput column={column} field={field} />
                    )}
                  />
                ))}
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

export default TableEditorDialog;

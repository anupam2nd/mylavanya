
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";

interface EditServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

const serviceFormSchema = z.object({
  jobno: z.string().optional(),
  ServiceName: z.string().optional(),
  ProductName: z.string().optional(),
  Status: z.string({
    required_error: "Please select a status",
  }),
  Purpose: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const EditServiceDialog: React.FC<EditServiceDialogProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { statusOptions, fetchStatusOptions } = useBookingStatusManagement();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      jobno: booking.jobno?.toString() || "",
      ServiceName: booking.ServiceName || "",
      ProductName: booking.ProductName || "",
      Status: booking.Status || "",
      Purpose: booking.Purpose || "",
    },
  });

  // Fetch status options when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      fetchStatusOptions();
    }
  }, [isOpen, fetchStatusOptions]);

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for update
      const updateData: Record<string, any> = {};
      
      // Only update Status - this is the only field artists can modify
      if (values.Status !== booking.Status) {
        updateData.Status = values.Status;
        updateData.StatusUpdated = new Date().toISOString();
      }
      
      // Only proceed if there are changes to update
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes made",
          description: "No changes were detected to update.",
        });
        onClose();
        return;
      }
      
      // Convert booking.id to number for database operation
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      // Update the booking
      const { error } = await supabase
        .from('BookMST')
        .update(updateData)
        .eq('id', bookingIdNumber);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Service Updated",
        description: "The service has been successfully updated.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the service. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Job Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ServiceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Service Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ProductName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Product Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.status_code} value={status.status_code}>
                          {status.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="Purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled placeholder="Notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="sm:w-auto w-full"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceDialog;


import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/hooks/useBookings";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { Loader2 } from "lucide-react";

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
  const { statusOptions, handleStatusChange, isUpdatingStatus, isLoading, fetchStatusOptions } = useBookingStatusManagement();
  const { toast } = useToast();
  
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

  // Fetch status options only once when the dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchStatusOptions();
    }
  }, [isOpen, fetchStatusOptions]);

  // Update form values when booking changes
  useEffect(() => {
    if (booking) {
      form.setValue("jobno", booking.jobno?.toString() || "");
      form.setValue("ServiceName", booking.ServiceName || "");
      form.setValue("ProductName", booking.ProductName || "");
      form.setValue("Status", booking.Status || "");
      form.setValue("Purpose", booking.Purpose || "");
    }
  }, [booking, form]);

  const handleSubmit = async (values: ServiceFormValues) => {
    if (isSubmitting || isUpdatingStatus) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if Status has changed
      if (values.Status !== booking.Status) {
        // Use the handleStatusChange function from the hook
        await handleStatusChange(booking, values.Status);
        toast({
          title: "Status updated",
          description: "The booking status has been successfully updated.",
        });
        onClose(); // Only close on success
      } else {
        toast({
          title: "No changes made",
          description: "No changes were detected to update.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Error toast is already shown in handleStatusChange
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get filtered status options for artists
  const filteredStatusOptions = statusOptions.filter(status => 
    ['on_the_way', 'service_started', 'done'].includes(status.status_code)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
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
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading status options...</span>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredStatusOptions.map((status) => (
                          <SelectItem key={status.status_code} value={status.status_code}>
                            {status.status_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                disabled={isSubmitting || isUpdatingStatus}
                className="sm:w-auto w-full"
              >
                {isSubmitting || isUpdatingStatus ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceDialog;

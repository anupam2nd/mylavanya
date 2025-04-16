
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Booking } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const AddJobDialog: React.FC<AddJobDialogProps> = ({ isOpen, onClose, booking }) => {
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceName.trim() || !price.trim() || isNaN(parseFloat(price))) {
      toast({
        title: "Invalid input",
        description: "Please provide a valid service name and price",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get highest job number for this booking
      const { data: existingJobs } = await supabase
        .from('BookMST')
        .select('jobno')
        .eq('Booking_NO', booking.Booking_NO)
        .order('jobno', { ascending: false })
        .limit(1);
      
      const nextJobNo = existingJobs && existingJobs.length > 0 && existingJobs[0].jobno 
        ? Number(existingJobs[0].jobno) + 1 
        : 1;
      
      // Insert the new job
      const { error } = await supabase
        .from('BookMST')
        .insert({
          Booking_NO: booking.Booking_NO,
          jobno: nextJobNo,
          Purpose: serviceName,
          price: parseFloat(price),
          name: booking.name,
          email: booking.email,
          Phone_no: booking.Phone_no,
          Address: booking.Address,
          Pincode: booking.Pincode,
          Booking_date: booking.Booking_date,
          booking_time: booking.booking_time,
          Status: "pending", // New job starts with pending status
          ArtistId: booking.ArtistId,
          Assignedto: booking.Assignedto,
          AssignedBY: booking.AssignedBY,
          AssingnedON: booking.AssingnedON
        });

      if (error) throw error;
      
      toast({
        title: "Job added successfully",
        description: `New job has been added to booking ${booking.Booking_NO}`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error adding new job:", error);
      toast({
        title: "Failed to add new job",
        description: "There was an error adding the new job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking-ref">Booking Reference</Label>
              <Input id="booking-ref" value={booking.Booking_NO || ""} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input id="customer-name" value={booking.name || ""} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name *</Label>
              <Input 
                id="service-name" 
                value={serviceName} 
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input 
                id="price" 
                type="number"
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;

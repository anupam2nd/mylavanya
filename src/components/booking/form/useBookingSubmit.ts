
import { useState } from "react";
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingFormValues } from "./FormSchema";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitBooking = async (formData: BookingFormValues) => {
    if (!formData.address || formData.address.trim().length < 10) {
      toast("Please provide a detailed address (minimum 10 characters)");
      return { success: false };
    }

    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      toast("Please enter a valid 6-digit PIN code");
      return { success: false };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const bookingData = {
        name: formData.name,
        Phone_no: parseInt(formData.phone, 10),
        email: formData.email || user.email,
        Address: formData.address,
        Pincode: parseInt(formData.pincode, 10),
        Booking_date: format(formData.selectedDate, 'yyyy-MM-dd'),
        booking_time: formData.selectedTime,
        Purpose: formData.notes || 'Service booking',
        ServiceName: formData.selectedServices[0]?.name || '',
        SubService: '',
        ProductName: formData.selectedServices[0]?.name || '',
        Product: formData.selectedServices[0]?.id || 1,
        price: formData.selectedServices[0]?.price || 0,
        Qty: formData.selectedServices[0]?.quantity || 1,
        Status: 'Booking Confirmed',
        StatusUpdated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('BookMST')
        .insert([bookingData])
        .select();

      if (error) throw error;

      toast("Booking submitted successfully!");
      
      return { success: true, bookingRef: data[0]?.Booking_NO?.toString() || '' };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Booking submission failed');
      toast("Failed to submit booking. Please try again.");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submitBooking
  };
};

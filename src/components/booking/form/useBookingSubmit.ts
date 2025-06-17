import { useState } from "react";
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BookingFormData } from "@/components/booking/BookingForm";

export const useBookingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSuccess = () => {};

  const handleSubmit = async (formData: BookingFormData) => {
    if (!formData.address || formData.address.trim().length < 10) {
      toast.error("Please provide a detailed address (minimum 10 characters)");
      return;
    }

    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
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
        Booking_date: format(formData.date, 'yyyy-MM-dd'),
        booking_time: formData.time,
        Purpose: formData.purpose || 'Service booking',
        ServiceName: formData.serviceName,
        SubService: formData.subservice || '',
        ProductName: formData.productName || formData.serviceName,
        Product: formData.serviceId,
        price: formData.servicePrice,
        Qty: formData.quantity || 1,
        Status: 'Booking Confirmed',
        StatusUpdated: new Date().toISOString(),
        created_at: new Date()
      };

      const { data, error } = await supabase
        .from('BookMST')
        .insert([bookingData])
        .select();

      if (error) throw error;

      toast.success("Booking submitted successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Booking submission failed');
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit
  };
};

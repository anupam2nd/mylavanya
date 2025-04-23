
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/hooks/useBookings";

interface ServiceManagementProps {
  booking: Booking;
  onServiceAdded: () => void;
}

export const ServiceManagement = ({ booking, onServiceAdded }: ServiceManagementProps) => {
  const { toast } = useToast();
  const [showAddService, setShowAddService] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('PriceMST')
        .select('*')
        .eq('active', true);
      
      if (error) {
        console.error('Error fetching services:', error);
        return;
      }
      
      setAvailableServices(data || []);
    };

    if (showAddService) {
      fetchServices();
    }
  }, [showAddService]);

  const handleAddNewService = async () => {
    if (!booking?.Booking_NO || !selectedService) return;

    try {
      const selectedServiceData = availableServices.find(s => s.prod_id.toString() === selectedService);
      if (!selectedServiceData) return;

      // Prepare booking data with the correct types for database
      const newBookingData = {
        Booking_NO: parseInt(booking.Booking_NO), // Convert to number for DB
        name: booking.name,
        email: booking.email,
        Phone_no: booking.Phone_no, 
        Address: booking.Address,
        Pincode: booking.Pincode,
        Booking_date: booking.Booking_date,
        booking_time: booking.booking_time,
        Purpose: booking.Purpose || "Beauty Service",
        ServiceName: selectedServiceData.Services,
        SubService: selectedServiceData.Subservice,
        ProductName: selectedServiceData.ProductName,
        price: selectedServiceData.Price,
        Product: parseInt(selectedServiceData.prod_id),
        Status: booking.Status || "pending",
        ArtistId: booking.ArtistId ? parseInt(booking.ArtistId) : null // Convert string to number for DB
      };

      const { error } = await supabase
        .from('BookMST')
        .insert(newBookingData);

      if (error) throw error;

      toast({
        title: "Service added successfully",
        description: "The new service has been added to the booking",
      });

      setShowAddService(false);
      setSelectedService("");
      onServiceAdded();
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error adding service",
        description: "There was an error adding the new service",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Services</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddService(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </div>

      {showAddService && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.prod_id} value={service.prod_id.toString()}>
                      {service.ProductName} - {service.Services}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddNewService}
                disabled={!selectedService}
              >
                Add Service
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setShowAddService(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

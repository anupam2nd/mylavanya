
import React, { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingData } from "./BookingDetails";
import { Phone, User } from "lucide-react";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { supabase } from "@/integrations/supabase/client";

interface CustomerDetailsProps {
  booking: BookingData;
}

interface ArtistDetails {
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistPhno?: number;
  emailid?: string;
}

const CustomerDetails = ({ booking }: CustomerDetailsProps) => {
  const { statusOptions } = useStatusOptions();
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  
  // Find the status description if available
  const statusDetails = statusOptions.find(
    option => option.status_name === booking.Status || option.status_code === booking.Status
  );
  
  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (!booking.ArtistId) return;

      try {
        const { data, error } = await supabase
          .from("ArtistMST")
          .select("ArtistFirstName, ArtistLastName, ArtistPhno, emailid")
          .eq("ArtistId", booking.ArtistId)
          .single();

        if (error) throw error;
        setArtistDetails(data);
      } catch (error) {
        console.error("Error fetching artist details:", error);
      }
    };

    if (booking.ArtistId) {
      fetchArtistDetails();
    }
  }, [booking.ArtistId]);
  
  return (
    <>
      {booking.name && (
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="font-medium">{booking.name}</p>
        </div>
      )}
      
      {booking.email && (
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="font-medium">{booking.email}</p>
        </div>
      )}
      
      {booking.Phone_no && (
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p className="font-medium flex items-center">
            <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
            {booking.Phone_no}
          </p>
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium text-gray-500">Status</p>
        <StatusBadge 
          status={booking.Status || 'pending'} 
          description={statusDetails?.description}
          showTooltip={!!statusDetails?.description}
        />
        {statusDetails?.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {statusDetails.description}
          </p>
        )}
      </div>
      
      {artistDetails && (
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500">Artist Assigned</p>
          <p className="font-medium flex items-center">
            <User className="h-4 w-4 mr-1 text-muted-foreground" />
            {artistDetails.ArtistFirstName} {artistDetails.ArtistLastName}
          </p>
          {artistDetails.ArtistPhno && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {artistDetails.ArtistPhno}
            </p>
          )}
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium text-gray-500">Booking Date</p>
        <p className="font-medium">{booking.Booking_date}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Booking Time</p>
        <p className="font-medium">{booking.booking_time}</p>
      </div>
      
      {booking.Address && (
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="font-medium">{booking.Address}</p>
        </div>
      )}
      
      {booking.Pincode && (
        <div>
          <p className="text-sm font-medium text-gray-500">Pincode</p>
          <p className="font-medium">{booking.Pincode}</p>
        </div>
      )}
    </>
  );
};

export default CustomerDetails;


import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/hooks/useBookings";

export const useBookingDetails = (
  booking: Booking | null,
  onStatusChange: (booking: Booking, newStatus: string) => Promise<void>,
  onArtistAssignment: (booking: Booking, artistId: string) => Promise<void>,
  onScheduleChange: (booking: Booking, date: string, time: string) => Promise<void>,
  relatedBookings: Booking[]
) => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [scheduleData, setScheduleData] = useState<{ date: Date | undefined; time: string }>({
    date: undefined,
    time: "09:00"
  });
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [currentArtistId, setCurrentArtistId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (booking) {
      setScheduleData({
        date: booking.Booking_date ? new Date(booking.Booking_date) : undefined,
        time: booking.booking_time ? booking.booking_time.substring(0, 5) : "09:00",
      });
      
      setCurrentStatus(booking.Status || 'pending');
      setCurrentArtistId(booking.ArtistId?.toString() || "");
    }
  }, [booking]);

  const handleStatusChangeWrapper = async (newStatus: string) => {
    if (!booking || isUpdating["status"]) return;
    
    if (newStatus === 'Beautician_assigned' && !currentArtistId) {
      toast({
        variant: "destructive",
        title: "Artist Required",
        description: "Please assign an artist before changing status to Beautician Assigned.",
      });
      return;
    }
    
    setIsUpdating((prev) => ({ ...prev, status: true }));
    try {
      await onStatusChange(booking, newStatus);
      setCurrentStatus(newStatus);
      
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onStatusChange(service, newStatus);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, status: false }));
    }
  };

  const handleArtistAssignmentWrapper = async (artistId: string) => {
    if (!booking || isUpdating["artist"]) return;
    
    setIsUpdating((prev) => ({ ...prev, artist: true }));
    try {
      await onArtistAssignment(booking, artistId);
      setCurrentArtistId(artistId);
      
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onArtistAssignment(service, artistId);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, artist: false }));
    }
  };

  const handleScheduleChangeWrapper = async () => {
    if (!booking || isUpdating["schedule"] || !scheduleData.date) return;
    
    setIsUpdating((prev) => ({ ...prev, schedule: true }));
    try {
      const formattedDate = format(scheduleData.date, "yyyy-MM-dd");
      await onScheduleChange(booking, formattedDate, scheduleData.time);
      
      if (booking.Booking_NO) {
        await Promise.all(
          relatedBookings.map(async (service) => {
            if (service.id !== booking.id) {
              await onScheduleChange(service, formattedDate, scheduleData.time);
            }
          })
        );
      }
    } finally {
      setIsUpdating((prev) => ({ ...prev, schedule: false }));
    }
  };

  return {
    isUpdating,
    scheduleData,
    currentStatus,
    currentArtistId,
    setScheduleData,
    handleStatusChangeWrapper,
    handleArtistAssignmentWrapper,
    handleScheduleChangeWrapper
  };
};

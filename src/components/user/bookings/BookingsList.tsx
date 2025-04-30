
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Booking } from "@/hooks/useBookings";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import BookingDetailsModal from "./BookingDetailsModal";
import MobileBookingView from "./MobileBookingView";
import DesktopBookingView from "./DesktopBookingView";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface BookingsListProps {
  filteredBookings: Booking[];
  clearFilters: () => void;
}

const BookingsList = ({ filteredBookings, clearFilters }: BookingsListProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({});
  
  // Extract all artist IDs to fetch their details
  const artistIds = filteredBookings
    .map(booking => booking.ArtistId)
    .filter(id => id !== undefined && id !== null);
    
  console.log("Artist IDs extracted:", artistIds);
    
  // Use the hook to get artist details
  const { getArtistName, getArtistPhone } = useArtistDetails(artistIds);
  
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };
  
  const handleCloseModal = () => {
    setSelectedBooking(null);
  };
  
  const toggleBookingExpansion = (bookingNo: string) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingNo]: !prev[bookingNo]
    }));
  };

  // Group bookings by Booking_NO
  const groupedBookings: Record<string, Booking[]> = {};
  filteredBookings.forEach(booking => {
    const key = booking.Booking_NO;
    if (!groupedBookings[key]) {
      groupedBookings[key] = [];
    }
    groupedBookings[key].push(booking);
  });

  return (
    <>
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedBookings).map(([bookingNo, bookingJobs]) => {
          // Use the first booking in each group as the main booking info
          const mainBooking = bookingJobs[0];
          
          return (
            <AccordionItem key={bookingNo} value={bookingNo}>
              {isMobile ? (
                <div className="cursor-pointer">
                  <AccordionTrigger>
                    <MobileBookingView 
                      bookings={[mainBooking]} 
                      getArtistName={getArtistName}
                      getArtistPhone={getArtistPhone}
                      onViewDetails={() => {}}
                      isAccordionItem={true}
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4 border-l-2 border-primary/20 ml-4 mt-2">
                      {bookingJobs.length > 1 ? (
                        bookingJobs.map((job, index) => (
                          <div key={`${job.Booking_NO}-${index}`} className="mb-3">
                            <div className="text-sm font-medium">{job.Purpose || job.ServiceName}</div>
                            <div className="text-xs text-muted-foreground">{job.SubService}</div>
                            <button 
                              className="text-xs text-primary hover:text-primary/70 mt-1"
                              onClick={() => handleViewDetails(job)}
                            >
                              View Details
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground py-2">
                          Click "View Details" to see more information
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </div>
              ) : (
                <>
                  <AccordionTrigger>
                    <DesktopBookingView 
                      bookings={[mainBooking]} 
                      getArtistName={getArtistName}
                      getArtistPhone={getArtistPhone}
                      onViewDetails={() => {}}
                      isAccordionItem={true}
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 border-l border-primary/20 ml-8 mt-2">
                      {bookingJobs.length > 1 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                              <th className="pb-2">Service</th>
                              <th className="pb-2">Quantity</th>
                              <th className="pb-2">Price</th>
                              <th className="pb-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookingJobs.map((job, index) => (
                              <tr key={`${job.Booking_NO}-${index}`}>
                                <td className="py-2">
                                  <div className="font-medium">{job.Purpose || job.ServiceName}</div>
                                  {job.SubService && <div className="text-xs text-muted-foreground">{job.SubService}</div>}
                                </td>
                                <td className="py-2">{job.Qty || 1}</td>
                                <td className="py-2">₹{job.price || 'N/A'}</td>
                                <td className="py-2 text-right">
                                  <button 
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => handleViewDetails(job)}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-sm text-muted-foreground py-2 text-center">
                          Click "View Details" to see more information
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          open={!!selectedBooking} 
          onOpenChange={handleCloseModal}
          getArtistName={getArtistName}
          getArtistPhone={getArtistPhone}
        />
      )}
    </>
  );
};

export default BookingsList;

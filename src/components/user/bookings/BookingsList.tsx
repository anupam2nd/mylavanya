
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Booking } from "@/hooks/useBookings";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import BookingDetailsModal from "./BookingDetailsModal";
import MobileBookingView from "./MobileBookingView";
import DesktopBookingView from "./DesktopBookingView";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Calendar, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

interface BookingsListProps {
  filteredBookings: Booking[];
  clearFilters: () => void;
}

const BookingsList = ({ filteredBookings, clearFilters }: BookingsListProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Extract all artist IDs to fetch their details
  const artistIds = filteredBookings
    .map(booking => booking.ArtistId)
    .filter(id => id !== undefined && id !== null);
    
  // Use the hook to get artist details
  const { getArtistName, getArtistPhone } = useArtistDetails(artistIds);
  
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };
  
  const handleCloseModal = () => {
    setSelectedBooking(null);
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
            <AccordionItem key={bookingNo} value={bookingNo} className="border bg-card rounded-lg mb-4 overflow-hidden">
              {isMobile ? (
                <>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <MobileBookingView 
                      bookings={[mainBooking]} 
                      getArtistName={getArtistName}
                      getArtistPhone={getArtistPhone}
                      onViewDetails={() => {}}
                      isAccordionItem={true}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-50">
                    <div className="px-4 py-2 space-y-3">
                      {bookingJobs.map((job, index) => (
                        <div key={`${job.Booking_NO}-${index}`} className="rounded-md bg-white p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium">{job.Purpose || job.ServiceName}</div>
                              {job.SubService && <div className="text-xs text-muted-foreground">{job.SubService}</div>}
                              <div className="mt-1.5">
                                <StatusBadge status={job.Status || 'pending'} className="text-xs" />
                              </div>
                            </div>
                            <div className="text-sm">₹{job.price || 'N/A'}</div>
                          </div>
                          
                          {job.ArtistId && (
                            <div className="mt-2 text-xs border-t pt-2 text-muted-foreground">
                              <p className="font-medium text-foreground">Artist: {getArtistName(job.ArtistId)}</p>
                              {getArtistPhone(job.ArtistId) && <p>Phone: {getArtistPhone(job.ArtistId)}</p>}
                            </div>
                          )}
                          
                          <div className="mt-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-7 text-primary"
                              onClick={() => handleViewDetails(job)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </>
              ) : (
                <>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="grid grid-cols-3 gap-4 w-full text-sm">
                      <div>
                        <div className="font-medium">{mainBooking.Booking_NO}</div>
                        <div className="text-xs text-muted-foreground">{bookingJobs.length} service(s)</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{mainBooking.Booking_date}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{mainBooking.booking_time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        Total: ₹{bookingJobs.reduce((sum, job) => sum + (job.price || 0), 0)}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-50 px-6 py-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="pb-2">Service</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Artist</th>
                            <th className="pb-2">Quantity</th>
                            <th className="pb-2">Price</th>
                            <th className="pb-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingJobs.map((job, index) => (
                            <tr key={`${job.Booking_NO}-${index}`} className="border-t border-gray-100">
                              <td className="py-2.5">
                                <div className="font-medium">{job.Purpose || job.ServiceName}</div>
                                {job.SubService && <div className="text-xs text-muted-foreground">{job.SubService}</div>}
                              </td>
                              <td className="py-2.5">
                                <StatusBadge status={job.Status || 'pending'} className="text-xs" />
                              </td>
                              <td className="py-2.5">
                                {job.ArtistId ? (
                                  <div>
                                    <div className="font-medium">{getArtistName(job.ArtistId)}</div>
                                    <div className="text-xs text-muted-foreground">{getArtistPhone(job.ArtistId)}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Not assigned</span>
                                )}
                              </td>
                              <td className="py-2.5">{job.Qty || 1}</td>
                              <td className="py-2.5">₹{job.price || 'N/A'}</td>
                              <td className="py-2.5 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-7 text-primary"
                                  onClick={() => handleViewDetails(job)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

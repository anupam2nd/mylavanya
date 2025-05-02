
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Booking } from "@/hooks/useBookings";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import BookingDetailsModal from "./BookingDetailsModal";
import MobileBookingView from "./MobileBookingView";
import DesktopBookingView from "./DesktopBookingView";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Calendar, ChevronDown, Clock } from "lucide-react";
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
      <Accordion type="multiple" className="w-full space-y-3">
        {Object.entries(groupedBookings).map(([bookingNo, bookingJobs]) => {
          // Use the first booking in each group as the main booking info
          const mainBooking = bookingJobs[0];
          
          return (
            <AccordionItem key={bookingNo} value={bookingNo} className="border bg-card overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md">
              {isMobile ? (
                <>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <MobileBookingView 
                      bookings={[mainBooking]} 
                      getArtistName={getArtistName}
                      getArtistPhone={getArtistPhone}
                      onViewDetails={() => {}}
                      isAccordionItem={true}
                    />
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/30">
                    <div className="px-4 py-2 space-y-3">
                      {bookingJobs.map((job, index) => (
                        <div key={`${job.Booking_NO}-${index}`} className="rounded-md bg-white p-3 shadow-sm hover:shadow transition-shadow">
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
                              className="text-xs h-7 text-primary hover:text-primary-foreground hover:bg-primary"
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
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="grid grid-cols-12 gap-6 w-full text-sm">
                      <div className="col-span-4 text-left">
                        <div className="text-xs text-muted-foreground">Booking No</div>
                        <div className="font-medium">{mainBooking.Booking_NO}</div>
                        <div className="text-xs text-muted-foreground mt-1">{bookingJobs.length} service(s)</div>
                      </div>
                      <div className="col-span-5 text-left">
                        <div className="text-xs text-muted-foreground mb-1">Service Time</div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>{mainBooking.Booking_date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>{mainBooking.booking_time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-medium text-base">₹{bookingJobs.reduce((sum, job) => sum + (job.price || 0), 0)}</div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/30 px-6 py-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="pb-2 font-medium">Service</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium">Artist</th>
                            <th className="pb-2 font-medium">Quantity</th>
                            <th className="pb-2 font-medium">Price</th>
                            <th className="pb-2 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingJobs.map((job, index) => (
                            <tr key={`${job.Booking_NO}-${index}`} className="border-t border-gray-100 hover:bg-muted/50">
                              <td className="py-3">
                                <div className="font-medium">{job.Purpose || job.ServiceName}</div>
                                {job.SubService && <div className="text-xs text-muted-foreground">{job.SubService}</div>}
                              </td>
                              <td className="py-3">
                                <StatusBadge status={job.Status || 'pending'} className="text-xs" />
                              </td>
                              <td className="py-3">
                                {job.ArtistId ? (
                                  <div>
                                    <div className="font-medium">{getArtistName(job.ArtistId)}</div>
                                    <div className="text-xs text-muted-foreground">{getArtistPhone(job.ArtistId)}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Not assigned</span>
                                )}
                              </td>
                              <td className="py-3">{job.Qty || 1}</td>
                              <td className="py-3">₹{job.price || 'N/A'}</td>
                              <td className="py-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-7 text-primary hover:text-primary-foreground hover:bg-primary"
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


import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import ArtistBookingCard from "./ArtistBookingCard";

interface ArtistBookingsListProps {
  groupedBookings: Record<string, any[]>;
  onAddNewService: (booking: any) => void;
  onRefreshBookings: () => void;
}

const ArtistBookingsList = ({ 
  groupedBookings, 
  onAddNewService, 
  onRefreshBookings 
}: ArtistBookingsListProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
        if (!bookingsGroup || !Array.isArray(bookingsGroup) || bookingsGroup.length === 0) {
          return null;
        }
        
        const firstBooking = bookingsGroup[0];
        const totalAmount = bookingsGroup.reduce((sum, job) => sum + (job.price || 0), 0);
        
        return (
          <Card key={bookingNo} className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="text-base sm:text-lg font-semibold">Booking #{bookingNo}</h3>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {bookingsGroup.length} service{bookingsGroup.length > 1 ? 's' : ''}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onAddNewService(firstBooking)}
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 shrink-0 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden xs:inline">Add New Service</span>
                    <span className="xs:hidden">Add Service</span>
                  </Button>
                </div>
                
                {/* Customer Info Grid - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{firstBooking.name}</span>
                  </div>
                  
                  {firstBooking.Phone_no && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{firstBooking.Phone_no}</span>
                    </div>
                  )}
                  
                  {firstBooking.email && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{firstBooking.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span>{firstBooking.Booking_date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span>{firstBooking.booking_time}</span>
                  </div>
                  
                  {firstBooking.Address && (
                    <div className="flex items-start gap-2 text-xs sm:text-sm sm:col-span-2 lg:col-span-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="break-words">
                        {firstBooking.Address}
                        {firstBooking.Pincode && `, ${firstBooking.Pincode}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {bookingsGroup.map((booking) => (
                  <div key={`${booking.id}-${booking.jobno}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{booking.Purpose || booking.ServiceName}</h4>
                          {booking.SubService && (
                            <p className="text-xs text-muted-foreground mt-1">{booking.SubService}</p>
                          )}
                        </div>
                        <div className="text-right sm:text-left">
                          <div className="font-medium text-sm sm:text-base">₹{booking.price || 'N/A'}</div>
                          {booking.Qty && booking.Qty > 1 && (
                            <div className="text-xs text-muted-foreground">Qty: {booking.Qty}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <StatusBadge status={booking.Status || 'pending'} className="text-xs w-fit" />
                        <div className="sm:ml-auto">
                          <ArtistBookingCard
                            booking={booking}
                            onStatusUpdated={onRefreshBookings}
                            isListView={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ArtistBookingsList;

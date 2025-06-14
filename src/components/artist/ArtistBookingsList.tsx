
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
    <div className="space-y-4">
      {Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
        if (!bookingsGroup || !Array.isArray(bookingsGroup) || bookingsGroup.length === 0) {
          return null;
        }
        
        const firstBooking = bookingsGroup[0];
        const totalAmount = bookingsGroup.reduce((sum, job) => sum + (job.price || 0), 0);
        
        return (
          <Card key={bookingNo} className="border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">Booking #{bookingNo}</h3>
                    <div className="text-sm text-muted-foreground">
                      {bookingsGroup.length} service(s) • ₹{totalAmount}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{firstBooking.name}</span>
                    </div>
                    
                    {firstBooking.Phone_no && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{firstBooking.Phone_no}</span>
                      </div>
                    )}
                    
                    {firstBooking.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{firstBooking.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{firstBooking.Booking_date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{firstBooking.booking_time}</span>
                    </div>
                    
                    {firstBooking.Address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">
                          {firstBooking.Address}
                          {firstBooking.Pincode && `, ${firstBooking.Pincode}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => onAddNewService(firstBooking)}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Add New Service
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {bookingsGroup.map((booking) => (
                  <div key={`${booking.id}-${booking.jobno}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{booking.Purpose || booking.ServiceName}</h4>
                          {booking.SubService && (
                            <p className="text-xs text-muted-foreground mt-1">{booking.SubService}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">₹{booking.price || 'N/A'}</div>
                          {booking.Qty && booking.Qty > 1 && (
                            <div className="text-xs text-muted-foreground">Qty: {booking.Qty}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <StatusBadge status={booking.Status || 'pending'} className="text-xs" />
                        <ArtistBookingCard
                          booking={booking}
                          onStatusUpdated={onRefreshBookings}
                          isListView={true}
                        />
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

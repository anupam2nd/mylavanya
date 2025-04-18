
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookingGroupCardProps {
  bookingNo: string;
  group: any[];
  isSelected: boolean;
  onSelect: (bookingNo: string) => void;
  onDeleteService: (booking: any) => void;
  calculateGroupTotal: (group: any[]) => number;
}

export const BookingGroupCard = ({
  bookingNo,
  group,
  isSelected,
  onSelect,
  onDeleteService,
  calculateGroupTotal
}: BookingGroupCardProps) => {
  return (
    <Card className={isSelected ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={isSelected}
                onChange={() => onSelect(bookingNo)}
                id={`booking-${bookingNo}`}
              />
              <label htmlFor={`booking-${bookingNo}`} className="font-medium">
                Booking #{bookingNo}
              </label>
              <Badge variant="outline" className="ml-2">
                {group.length} {group.length === 1 ? 'service' : 'services'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(group[0].Booking_date), "MMMM d, yyyy")}
                </span>
                <span className="mx-1">•</span>
                <Clock className="h-3 w-3" />
                <span>{group[0].booking_time}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {group[0].Address}, {group[0].Pincode}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              ₹{calculateGroupTotal(group).toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {group.map(booking => (
            <li key={booking.id} className="py-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{booking.Purpose}</p>
                  <div className="text-sm text-muted-foreground">
                    {booking.ServiceName && <span>{booking.ServiceName}</span>}
                    {booking.SubService && <span> - {booking.SubService}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p>₹{booking.price} × {booking.Qty || 1}</p>
                    <p className="font-medium">₹{((booking.price || 0) * (booking.Qty || 1)).toFixed(2)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDeleteService(booking)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

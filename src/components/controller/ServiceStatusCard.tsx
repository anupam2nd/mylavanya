
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@/hooks/useBookings";
import { Calendar, User, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ServiceStatusCardProps {
  booking: Booking;
}

export const ServiceStatusCard = ({ booking }: ServiceStatusCardProps) => {
  // Format date if it's a valid date string
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    
    try {
      return format(parseISO(dateStr), "dd MMM yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  // Get appropriate badge color based on status
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("pending") || statusLower === "p") {
      return "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("confirm") || statusLower === "c") {
      return "bg-green-100 text-green-800";
    } else if (statusLower.includes("done") || statusLower === "d") {
      return "bg-blue-100 text-blue-800";
    } else if (statusLower.includes("cancel") || statusLower === "x") {
      return "bg-red-100 text-red-800";
    } else if (statusLower.includes("on_the_way")) {
      return "bg-purple-100 text-purple-800";
    } else if (statusLower.includes("beautician_assigned")) {
      return "bg-indigo-100 text-indigo-800";
    }
    
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{booking.ServiceName || booking.ProductName}</CardTitle>
          <Badge className={`${getStatusColor(booking.Status)}`}>
            {booking.Status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium ml-1">{booking.name || "N/A"}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Date:</span>
            <span className="font-medium ml-1">{formatDate(booking.Booking_date)}</span>
          </div>
          
          {booking.Address && (
            <div className="flex items-start text-sm">
              <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="font-medium ml-1">{booking.Address}</span>
                {booking.Pincode && <span className="text-sm text-gray-500 ml-1">({booking.Pincode})</span>}
              </div>
            </div>
          )}

          {booking.Assignedto && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Assigned to:</span>
              <span className="font-medium ml-1 text-sm">{booking.Assignedto}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

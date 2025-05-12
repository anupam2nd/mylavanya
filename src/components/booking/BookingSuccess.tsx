
import { Button } from "@/components/ui/button";
import { Check, ClipboardCopy, FileText, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom"; 

const BookingSuccess = ({ bookingRef }: { bookingRef: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        
        <p className="text-muted-foreground">
          Your booking has been successfully placed. Please save your booking reference number for future queries.
        </p>
        
        <div className="bg-primary/10 rounded-lg p-4 w-full flex justify-between items-center">
          <span className="font-mono font-medium text-lg">{bookingRef}</span>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex flex-col gap-3 w-full">
          <Button asChild variant="default" className="w-full flex items-center gap-2">
            <Link to="/user/bookings">
              <CalendarCheck className="h-5 w-5 mr-1" />
              View My Bookings
            </Link>
          </Button>
          
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" className="w-1/2">
              <Link to="/" className="w-full">
                Return Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-1/2">
              <Link to="/services" className="w-full">
                Book Another Service
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

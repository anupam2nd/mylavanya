
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const FloatingTrackButton = () => {
  return (
    <Link 
      to="/track-booking"
      className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all z-50 flex items-center justify-center"
      aria-label="Track Booking"
    >
      <FileText className="h-5 w-5" />
      <span className="ml-2 hidden md:inline">Track Booking</span>
    </Link>
  );
};

export default FloatingTrackButton;

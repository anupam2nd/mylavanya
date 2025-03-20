
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavTrackingButton = () => {
  return (
    <Link to="/track-booking">
      <Button variant="outline" size="sm" className="ml-2 border-primary/50 hover:bg-primary/10 hover:text-primary">
        <FileText className="h-4 w-4 mr-2 text-primary" /> Track Booking
      </Button>
    </Link>
  );
};

export default NavTrackingButton;

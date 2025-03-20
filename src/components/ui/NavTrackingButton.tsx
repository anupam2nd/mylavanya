
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavTrackingButton = () => {
  return (
    <Link to="/track-booking">
      <Button variant="outline" size="sm" className="ml-2">
        <FileText className="h-4 w-4 mr-2" /> Track Booking
      </Button>
    </Link>
  );
};

export default NavTrackingButton;

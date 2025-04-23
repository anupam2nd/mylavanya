
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BookingRoleCheckProps {
  user: { role?: string } | null;
}

const BookingRoleCheck = ({ user }: BookingRoleCheckProps) => {
  const navigate = useNavigate();

  if (user && user.role !== "member") {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Members Only</h3>
        <p className="text-amber-700 mb-4">
          Only members can book services. Please login as a member to continue.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }
  return null;
};

export default BookingRoleCheck;

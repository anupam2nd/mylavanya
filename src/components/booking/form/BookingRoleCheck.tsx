
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookingRoleCheckProps {
  user: { role?: string } | null;
}

const BookingRoleCheck = ({ user }: BookingRoleCheckProps) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-500" />
          Login Required
        </h3>
        <p className="text-blue-700 mb-4">
          Please login to your account to book services.
        </p>
        <Button onClick={() => navigate("/")}>
          Login Now
        </Button>
      </div>
    );
  }

  if (user.role !== "member") {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-amber-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Members Only
        </h3>
        <p className="text-amber-700 mb-4">
          Only members can book services. Please login as a member to continue.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  // For fully authenticated members, return null
  return null;
};

export default BookingRoleCheck;

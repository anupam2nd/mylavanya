
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ButtonCustom } from "@/components/ui/button-custom";

interface CheckoutButtonProps {
  bookings: Booking[];
  count?: number;
}

const CheckoutButton = ({ bookings, count }: CheckoutButtonProps) => {
  const navigate = useNavigate();
  
  // Filter pending bookings that need payment
  const pendingBookings = bookings.filter(booking => 
    booking.Status === 'pending' || booking.Status === 'awaiting_payment'
  );
  
  // Count pending bookings if count is not provided
  const pendingCount = count !== undefined ? count : pendingBookings.length;
  
  if (pendingCount === 0) {
    return null;
  }
  
  return (
    <ButtonCustom
      variant="primary-gradient"
      size="sm"
      className="flex items-center gap-2"
      onClick={() => navigate('/user/checkout', { 
        state: { 
          pendingBookings: pendingBookings 
        } 
      })}
    >
      <ShoppingBag className="h-4 w-4" />
      <span>Checkout</span>
      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white text-primary font-bold">
        {pendingCount}
      </span>
    </ButtonCustom>
  );
};

export default CheckoutButton;

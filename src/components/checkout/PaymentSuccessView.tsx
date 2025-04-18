
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PaymentSuccessView = () => {
  const navigate = useNavigate();

  const handleBackToBookings = () => {
    navigate('/user/bookings');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-green-700 mb-6">Your booking has been confirmed. Thank you for your payment.</p>
          
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToBookings}
            >
              View Your Bookings
            </Button>
            <Button
              onClick={() => navigate('/services')}
            >
              Book More Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

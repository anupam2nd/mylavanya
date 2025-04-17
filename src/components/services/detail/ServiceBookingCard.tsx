
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import BookingForm from "@/components/booking/BookingForm";
import { toast } from "@/hooks/use-toast";

interface ServiceBookingCardProps {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  serviceOriginalPrice: number;
  isMember: boolean;
  showBookingForm: boolean;
  user: any;
  onCancel: () => void;
  onSuccess: () => void;
  onBookNowClick: () => void;
}

const ServiceBookingCard: React.FC<ServiceBookingCardProps> = ({ 
  serviceId, 
  serviceName, 
  servicePrice, 
  serviceOriginalPrice,
  isMember, 
  showBookingForm, 
  user, 
  onCancel, 
  onSuccess, 
  onBookNowClick 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h2 className="text-lg font-semibold mb-3 text-center">Book This Service</h2>
      
      {isMember ? (
        !showBookingForm ? (
          <ButtonCustom 
            variant="primary-gradient" 
            className="w-full" 
            size="lg" 
            onClick={onBookNowClick}
          >
            Book Now
          </ButtonCustom>
        ) : (
          <BookingForm 
            serviceId={serviceId} 
            serviceName={serviceName} 
            servicePrice={servicePrice}
            serviceOriginalPrice={serviceOriginalPrice}
            onCancel={onCancel} 
            onSuccess={onSuccess} 
          />
        )
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600 mb-2">Only members can book services</p>
          {!user && (
            <Button 
              variant="outline" 
              onClick={() => {
                // Store current path for redirect after login
                sessionStorage.setItem('bookingRedirectPath', window.location.pathname);
                navigate("/auth");
              }}
            >
              Login as Member
            </Button>
          )}
        </div>
      )}
      
      <div className="border-t mt-6 pt-6">
        <h3 className="font-medium text-center mb-4">Need Help?</h3>
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">Contact our customer support</p>
          <p className="text-primary font-medium">contactus@lavanya.com</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingCard;

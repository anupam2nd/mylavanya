
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useServiceDetail } from "@/hooks/useServiceDetail";
import { getServiceImage } from "@/utils/serviceImageUtils";
import ServiceHeader from "@/components/services/detail/ServiceHeader";
import ServiceImageSection from "@/components/services/detail/ServiceImageSection";
import ServiceBookingCard from "@/components/services/detail/ServiceBookingCard";
import ServiceErrorState from "@/components/services/detail/ServiceErrorState";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string; }>();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  
  const { 
    service, 
    loading, 
    error, 
    finalPrice, 
    formattedServiceName 
  } = useServiceDetail(serviceId);

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
  };

  const handleBookNowClick = () => {
    if (!user) {
      // Store current path for redirect after login
      sessionStorage.setItem('bookingRedirectPath', window.location.pathname);
      window.location.href = '/';
      return;
    }
    
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <ServiceErrorState error={error} />;
  }

  if (!service) {
    return <ServiceErrorState isNotFound={true} />;
  }

  const serviceImage = getServiceImage(service.prod_id, service.ProductName);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ServiceHeader 
        serviceName={service.ProductName}
        serviceType={service.Services}
        subservice={service.Subservice}
        price={service.Price}
        discount={service.Discount}
        finalPrice={finalPrice}
        netPayable={service.NetPayable}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ServiceImageSection 
              image={serviceImage}
              productName={service.ProductName || ''}
              description={service.Description || ''}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ServiceBookingCard 
              serviceId={service.prod_id}
              serviceName={formattedServiceName}
              servicePrice={finalPrice}
              serviceOriginalPrice={service.Price}
              isMember={isMember}
              showBookingForm={showBookingForm}
              user={user}
              onCancel={() => setShowBookingForm(false)}
              onSuccess={handleBookingSuccess}
              onBookNowClick={handleBookNowClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

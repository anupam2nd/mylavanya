import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import BookingForm from "@/components/booking/BookingForm";
import { toast } from "@/hooks/use-toast";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching service with ID:", serviceId);

        // Convert serviceId to number
        if (!serviceId) {
          throw new Error("Service ID is required");
        }
        const serviceIdNumber = parseInt(serviceId);
        if (isNaN(serviceIdNumber)) {
          throw new Error("Invalid service ID");
        }
        
        // Query for an active service with the specified ID
        const { data, error } = await supabase
          .from('PriceMST')
          .select('*')
          .eq('prod_id', serviceIdNumber)
          .eq('active', true) // Only fetch active services
          .single();
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        console.log("Service data:", data);
        setService(data);
      } catch (error) {
        console.error("Error fetching service details:", error);
        setError("Could not load service details or the service may be inactive");
        toast({
          title: "Error",
          description: "Could not load service details or the service may be inactive",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    // We don't need to do anything else here as the form component now displays the success state
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }
  
  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Error Loading Service</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate("/services")}>
          Back to Services
        </Button>
      </div>;
  }
  
  if (!service) {
    return <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Service not found</h2>
        <p className="text-gray-600 mb-6">The service you are looking for does not exist.</p>
        <Button onClick={() => navigate("/services")}>
          Back to Services
        </Button>
      </div>;
  }
  
  return <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-gradient-to-r from-violet-100 to-purple-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/services")} className="mb-4">
            ← Back to Services
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{service?.ProductName}</h1>
          <p className="text-lg font-medium text-primary mt-1">₹{service?.Price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 sm:h-80 bg-gray-200">
                <img alt={service?.ProductName} className="w-full h-full object-cover" src="/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
                <p className="text-gray-600 mb-6">
                  {service?.Description || "Professional beauty service tailored for weddings and special occasions. Our expert team uses premium products to ensure you look your best on your special day."}
                </p>
                
                <h3 className="text-xl font-medium mb-3">What's Included</h3>
                <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                  <li>Professional makeup application</li>
                  <li>Consultation to understand your preferences</li>
                  <li>Premium quality products</li>
                  <li>Touch-ups for perfect finish</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-3">Additional Information</h3>
                <p className="text-gray-600">
                  Our services are available for on-site appointments. We bring all necessary equipment to your location, whether it's a hotel, home, or venue.
                </p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-3 text-center">Book This Service</h2>
              
              {!showBookingForm ? (
                <ButtonCustom 
                  variant="primary-gradient" 
                  className="w-full" 
                  size="lg" 
                  onClick={() => setShowBookingForm(true)}
                >
                  Book Now
                </ButtonCustom>
              ) : (
                <BookingForm 
                  serviceId={service.prod_id} 
                  serviceName={service.ProductName} 
                  servicePrice={service.Price} 
                  onCancel={() => setShowBookingForm(false)}
                  onSuccess={handleBookingSuccess}
                />
              )}
              
              <div className="border-t mt-6 pt-6">
                <h3 className="font-medium text-center mb-4">Need Help?</h3>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Contact our customer support</p>
                  <p className="text-primary font-medium">support@mylavanya.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default ServiceDetail;

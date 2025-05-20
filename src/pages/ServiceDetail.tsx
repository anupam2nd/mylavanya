import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import BookingForm from "@/components/booking/BookingForm";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { Heart, Image } from "lucide-react";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string; }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Handle incorrect URL format: "/service/" (singular) should be "/services/" (plural)
  useEffect(() => {
    // Check if we're on the wrong path format
    if (location.pathname.includes('/service/') && !location.pathname.includes('/services/')) {
      // Get the service ID from the incorrect path
      const serviceIdFromPath = location.pathname.split('/').pop();
      
      // First check if we have a valid ID to work with
      if (serviceIdFromPath && !isNaN(Number(serviceIdFromPath))) {
        // Redirect to the correct path with the same ID
        const correctPath = location.pathname.replace('/service/', '/services/');
        navigate(correctPath, { replace: true });
      } else {
        // If we don't have a valid ID, just go back to services listing
        navigate('/services', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // Handle the case when user manually enters /service/ID directly
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname.includes('/service/') && !location.pathname.includes('/services/')) {
        navigate('/services', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching service with ID:", serviceId);

        if (!serviceId) {
          throw new Error("Service ID is required");
        }
        const serviceIdNumber = parseInt(serviceId);
        if (isNaN(serviceIdNumber)) {
          throw new Error("Invalid service ID");
        }

        const {
          data,
          error
        } = await supabase.from('PriceMST').select('*').eq('prod_id', serviceIdNumber).eq('active', true).single();
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
  
  useEffect(() => {
    // Check if service is in the user's wishlist
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user || !serviceId) return;
      
      try {
        const serviceIdNumber = parseInt(serviceId);
        if (isNaN(serviceIdNumber)) return;
        
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', parseInt(user.id))
          .eq('service_id', serviceIdNumber)
          .maybeSingle();
          
        if (error) throw error;
        setIsInWishlist(!!data);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };
    
    checkWishlistStatus();
  }, [isAuthenticated, user, serviceId]);

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
  };

  const handleBookNowClick = () => {
    if (isAuthenticated && user?.role === 'member') {
      setShowBookingForm(true);
    } else {
      // Show auth modal for login/registration
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Small delay to ensure auth context is updated
    setTimeout(() => {
      setShowBookingForm(true);
    }, 300);
  };
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (!serviceId || !user) return;
    const serviceIdNumber = parseInt(serviceId);
    if (isNaN(serviceIdNumber)) return;
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Get the wishlist item id first
        const { data: wishlistItem, error: fetchError } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', parseInt(user.id))
          .eq('service_id', serviceIdNumber)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItem.id)
          .eq('user_id', parseInt(user.id));
          
        if (removeError) throw removeError;
        
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${service?.ProductName || 'Service'} has been removed from your wishlist`,
        });
      } else {
        // Add to wishlist
        const { error: addError } = await supabase
          .from('wishlist')
          .insert({
            user_id: parseInt(user.id),
            service_id: serviceIdNumber
          });
          
        if (addError) throw addError;
        
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${service?.ProductName || 'Service'} has been added to your wishlist`,
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your wishlist",
        variant: "destructive"
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBackNavigation = () => {
    navigate("/services");
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
        <Button onClick={handleBackNavigation}>
          Back to Services
        </Button>
      </div>;
  }

  if (!service) {
    return <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">Service not found</h2>
        <p className="text-gray-600 mb-6">The service you are looking for does not exist.</p>
        <Button onClick={handleBackNavigation}>
          Back to Services
        </Button>
      </div>;
  }

  // Use imageUrl directly from service data
  const serviceImage = service.imageUrl || "/placeholder.svg";
  
  const formattedServiceName = service ? [
    service.Services,
    service.Subservice,
    service.ProductName
  ].filter(Boolean).join(' - ') : '';
  
  const finalPrice = service ? (
    service.NetPayable !== null && service.NetPayable !== undefined 
      ? service.NetPayable 
      : service.Discount 
        ? service.Price - (service.Price * service.Discount / 100) 
        : service.Price
  ) : 0;

  return <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-gradient-to-r from-violet-100 to-purple-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={handleBackNavigation} className="mb-4">
            ← Back to Services
          </Button>
          
          <div className="flex flex-col space-y-2">
            <div>
              <StatusBadge status={service.Services} className="text-lg font-bold px-4 py-2 bg-primary/20 text-primary">
                {service.Services}
              </StatusBadge>
            </div>
            {service.Subservice && (
              <div className="text-xl font-medium text-gray-700">{service.Subservice}</div>
            )}
            {service.ProductName && (
              <div className="text-base text-gray-500">{service.ProductName}</div>
            )}
            
            {/* Price display with discount if available */}
            {service.Discount || (service.NetPayable !== null && service.NetPayable !== undefined) ? (
              <div className="flex items-center space-x-2 mt-1">
                <span className="line-through text-gray-500">₹{service.Price.toFixed(2)}</span>
                <span className="text-lg font-medium text-primary">₹{finalPrice.toFixed(2)}</span>
                {service.Discount && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                    {service.Discount}% OFF
                  </span>
                )}
              </div>
            ) : (
              <p className="text-lg font-medium text-primary mt-1">₹{service.Price.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 sm:h-80 bg-gray-200">
                {serviceImage ? (
                  <img alt={service.ProductName} className="w-full h-full object-cover" src={serviceImage} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
                <p className="text-gray-600 mb-6">
                  {service.Description || "Professional beauty service tailored for weddings and special occasions. Our expert team uses premium products to ensure you look your best on your special day."}
                </p>
                
                <h3 className="text-xl font-medium mb-3">What's Included</h3>
                <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                  <li className="text-base font-semibold">Consultation to understand your preferences</li>
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
                <div className="space-y-3">
                  <ButtonCustom 
                    variant="primary-gradient" 
                    className="w-full" 
                    size="lg" 
                    onClick={handleBookNowClick}
                  >
                    Book Now
                  </ButtonCustom>
                  
                  <ButtonCustom 
                    variant="outline" 
                    className={`w-full flex items-center justify-center gap-2 ${
                      isInWishlist ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600' : ''
                    }`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                  >
                    <Heart className={`${isInWishlist ? 'fill-rose-500' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`} size={18} />
                    {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </ButtonCustom>
                </div>
              ) : (
                <BookingForm 
                  serviceId={service.prod_id} 
                  serviceName={formattedServiceName} 
                  servicePrice={finalPrice}
                  serviceOriginalPrice={service.Price}
                  onCancel={() => setShowBookingForm(false)} 
                  onSuccess={handleBookingSuccess} 
                />
              )}
              
              <div className="border-t mt-6 pt-6">
                <h3 className="font-medium text-center mb-4">Need Help?</h3>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Contact our customer support</p>
                  <p className="text-primary font-medium">contactus@lavanya.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab="member"
      />
    </div>;
};

export default ServiceDetail;


import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Heart, Star, MapPin, Clock, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import BookingForm from "@/components/booking/BookingForm";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";

interface Service {
  prod_id: number;
  ProductName: string;
  Services: string;
  Price: number;
  Description: string;
  Category: string;
  SubCategory: string;
  Subservice: string;
  Scheme: string;
  Discount: number;
  NetPayable: number;
  imageUrl: string;
  active: boolean;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  
  const { toggleWishlist, isInWishlist, wishlistLoading } = useWishlist(service?.prod_id);
  
  // Check if we should auto-open booking form
  const shouldAutoBook = searchParams.get('book') === 'true';
  const fromHome = location.state?.fromHome;

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  // Auto-open booking form if book=true parameter is present
  useEffect(() => {
    if (shouldAutoBook && service && isAuthenticated) {
      setShowBookingForm(true);
      // Clean up the URL parameter
      const params = new URLSearchParams(searchParams);
      params.delete('book');
      navigate(`/services/${id}?${params.toString()}`, { replace: true });
    }
  }, [shouldAutoBook, service, isAuthenticated, id, navigate, searchParams]);

  const fetchService = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('PriceMST')
        .select('*')
        .eq('prod_id', parseInt(id))
        .eq('active', true)
        .single();

      if (error) {
        toast.error("Service not found");
        navigate('/services');
        return;
      }

      setService(data);
      
      // Fetch related services
      if (data.Category) {
        const { data: related } = await supabase
          .from('PriceMST')
          .select('*')
          .eq('Category', data.Category)
          .eq('active', true)
          .neq('prod_id', parseInt(id))
          .limit(3);
        
        if (related) {
          setRelatedServices(related);
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a service");
      return;
    }
    setShowBookingForm(true);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    await toggleWishlist();
  };

  const handleBack = () => {
    if (fromHome) {
      navigate('/');
    } else {
      navigate('/services');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showBookingForm) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl md:text-2xl font-bold truncate">
                  Book {service.ProductName}
                </h1>
              </div>
              
              <BookingForm
                serviceId={service.prod_id}
                serviceName={service.ProductName || service.Services}
                servicePrice={service.NetPayable || service.Price}
                serviceOriginalPrice={service.Price}
                onCancel={() => setShowBookingForm(false)}
                onSuccess={() => {
                  setShowBookingForm(false);
                  toast.success("Booking completed successfully!");
                }}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl font-bold truncate">
                  {service.ProductName || service.Services}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground truncate">
                  {service.Category} • {service.SubCategory}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.ProductName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="space-y-6">
                {/* Price Section */}
                <Card className="p-4 md:p-6 shadow-sm">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl md:text-3xl font-bold text-primary">
                      ₹{service.NetPayable || service.Price}
                    </span>
                    {service.NetPayable && service.NetPayable !== service.Price && (
                      <>
                        <span className="text-lg md:text-xl text-gray-500 line-through">
                          ₹{service.Price}
                        </span>
                        {service.Discount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {service.Discount}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {service.Category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {service.SubCategory}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      className="flex-1 text-base py-3"
                      onClick={handleBookNow}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                    
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleWishlistToggle}
                        disabled={wishlistLoading}
                        className="sm:w-auto"
                      >
                        <Heart 
                          className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Description */}
                <Card className="p-4 md:p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">Service Description</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {service.Description || "Professional service tailored to your needs."}
                  </p>
                </Card>

                {/* Service Details */}
                <Card className="p-4 md:p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">Service Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base">Service: {service.Services}</span>
                    </div>
                    {service.Subservice && (
                      <div className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">Specialty: {service.Subservice}</span>
                      </div>
                    )}
                    {service.Scheme && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">Package: {service.Scheme}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base">Available at your location</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base">Flexible timing available</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-6">Related Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {relatedServices.map((relatedService) => (
                    <Card key={relatedService.prod_id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div 
                        className="aspect-video bg-gray-100 overflow-hidden"
                        onClick={() => navigate(`/services/${relatedService.prod_id}`)}
                      >
                        {relatedService.imageUrl ? (
                          <img
                            src={relatedService.imageUrl}
                            alt={relatedService.ProductName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 text-sm md:text-base">
                          {relatedService.ProductName || relatedService.Services}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-bold text-primary text-sm md:text-base">
                            ₹{relatedService.NetPayable || relatedService.Price}
                          </span>
                          {relatedService.NetPayable && relatedService.NetPayable !== relatedService.Price && (
                            <span className="text-xs md:text-sm text-gray-500 line-through">
                              ₹{relatedService.Price}
                            </span>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs md:text-sm"
                          onClick={() => navigate(`/services/${relatedService.prod_id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceDetail;

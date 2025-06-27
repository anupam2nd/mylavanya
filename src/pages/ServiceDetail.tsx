
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import BookingForm from "@/components/booking/BookingForm";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import ServiceDetailHeader from "@/components/service-detail/ServiceDetailHeader";
import ServiceImage from "@/components/service-detail/ServiceImage";
import ServiceActions from "@/components/service-detail/ServiceActions";
import ServiceInfo from "@/components/service-detail/ServiceInfo";
import RelatedServices from "@/components/service-detail/RelatedServices";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <ServiceDetailHeader
              productName={service.ProductName}
              services={service.Services}
              category={service.Category}
              subCategory={service.SubCategory}
              onBack={handleBack}
            />

            {/* Full Width Image with 16:9 aspect ratio */}
            <div className="mb-8">
              <ServiceImage
                imageUrl={service.imageUrl}
                productName={service.ProductName}
              />
            </div>

            {/* Content Below Image */}
            <div className="space-y-6 mb-8">
              {/* Price Section */}
              <ServiceActions
                price={service.Price}
                netPayable={service.NetPayable}
                discount={service.Discount}
                category={service.Category}
                subCategory={service.SubCategory}
                isAuthenticated={isAuthenticated}
                isInWishlist={isInWishlist}
                wishlistLoading={wishlistLoading}
                onBookNow={handleBookNow}
                onWishlistToggle={handleWishlistToggle}
              />

              {/* Service Information */}
              <ServiceInfo
                description={service.Description}
                services={service.Services}
                subservice={service.Subservice}
                scheme={service.Scheme}
              />
            </div>

            {/* Related Services */}
            <RelatedServices services={relatedServices} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceDetail;

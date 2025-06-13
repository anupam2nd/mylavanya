
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "./ServiceCard";
import { ButtonCustom } from "@/components/ui/button-custom";

interface ServiceListProps {
  featured?: boolean;
  searchTerm?: string;
  selectedCategory?: string;
  selectedSubCategory?: string;
}

// Define a service type that matches the actual database schema
interface Service {
  prod_id: number;
  ProductName: string | null;
  Price: number;
  Description: string | null;
  created_at?: string;
  Services: string;
  active: boolean;
  Discount: number | null;
  Subservice: string | null;
  NetPayable: number | null;
  Category: string | null;
  SubCategory: string | null;
  imageUrl: string | null;
  Scheme?: string | null;
}

const ServiceList = ({ 
  featured = false, 
  searchTerm = "", 
  selectedCategory = "all",
  selectedSubCategory = "all"
}: ServiceListProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching active services with filters:", { selectedCategory, selectedSubCategory });
        
        // Create a query to the PriceMST table and filter for active services only
        let query = supabase
          .from('PriceMST')
          .select('*')
          .eq('active', true) // Only fetch active services
          .order('prod_id', { ascending: true }); // Sort by prod_id in ascending order
        
        // Apply category filter if provided
        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('Category', selectedCategory);
        }

        // Apply sub-category filter if provided
        if (selectedSubCategory && selectedSubCategory !== 'all') {
          query = query.eq('SubCategory', selectedSubCategory);
        }
        
        // Limit results if featured is true
        if (featured) {
          query = query.limit(4);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Services fetched:", data?.length || 0);
        
        if (!data || data.length === 0) {
          console.log("No active services found for the selected filters.");
          setServices([]);
        } else {
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [featured, selectedCategory, selectedSubCategory]);
  
  // Filter services based on search term
  const filteredServices = services.filter(service => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      service.ProductName?.toLowerCase().includes(searchLower) ||
      service.Services?.toLowerCase().includes(searchLower) ||
      service.Category?.toLowerCase().includes(searchLower) ||
      service.SubCategory?.toLowerCase().includes(searchLower) ||
      service.Description?.toLowerCase().includes(searchLower) ||
      service.Scheme?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleServiceClick = (serviceId: number) => {
    console.log("Navigating to service detail:", serviceId);
    navigate(`/services/${serviceId}`);
  };
  
  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {featured ? "Our Featured Services" : "Browse All Services"}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Professional beauty services tailored for weddings and special events
          </p>
        </div>
        
        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <ButtonCustom 
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </ButtonCustom>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard 
                key={service.prod_id}
                id={service.prod_id}
                name={service.ProductName || "Unnamed Service"}
                price={service.Price}
                description={service.Description || ""}
                discountedPrice={service.NetPayable || undefined}
                imageUrl={service.imageUrl || undefined}
                category={service.Category || undefined}
                scheme={service.Scheme || undefined}
                discount={service.Discount || undefined}
                onClick={() => handleServiceClick(service.prod_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600">
              {searchTerm 
                ? `No services found for "${searchTerm}"` 
                : "No active services available for the selected filters"
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm 
                ? "Try adjusting your search terms or filters"
                : "Try selecting different category or sub-category filters"
              }
            </p>
          </div>
        )}
        
        {featured && filteredServices.length > 0 && (
          <div className="mt-12 text-center">
            <ButtonCustom
              variant="primary-gradient"
              size="lg"
              onClick={() => navigate('/services')}
              className="px-8"
            >
              View All Services
            </ButtonCustom>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;

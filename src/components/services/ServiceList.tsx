
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "./ServiceCard";
import { ButtonCustom } from "@/components/ui/button-custom";

interface ServiceListProps {
  featured?: boolean;
  categoryFilter?: string;
}

// Define a service type to solve the excessive typing depth issue
interface Service {
  prod_id: number;
  ProductName: string;
  Price: number;
  Description?: string;
  pcatgry?: string;
}

const ServiceList = ({ featured = false, categoryFilter }: ServiceListProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching services with filter:", categoryFilter);
        
        let query = supabase
          .from('PriceMST')
          .select('*')
        
        // Apply filters if needed
        if (categoryFilter) {
          query = query.eq('pcatgry', categoryFilter);
        }
        
        // Limit results for featured section
        if (featured) {
          query = query.limit(4);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Services fetched:", data);
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [featured, categoryFilter]);
  
  const handleServiceClick = (serviceId: number) => {
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
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard 
                key={service.prod_id}
                service={{
                  prodid: service.prod_id,
                  pname: service.ProductName,
                  pprice: service.Price,
                  pdesc: service.Description
                }}
                onClick={() => handleServiceClick(service.prod_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600">No services available</p>
          </div>
        )}
        
        {featured && services.length > 0 && (
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

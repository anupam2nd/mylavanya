
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ServiceCard from "./ServiceCard";
import { ButtonCustom } from "@/components/ui/button-custom";

interface ServiceListProps {
  featured?: boolean;
  categoryFilter?: string;
}

const ServiceList = ({ featured = false, categoryFilter }: ServiceListProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      
      try {
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
          throw error;
        }
        
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
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
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {featured ? "Our Featured Services" : "Browse All Services"}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Professional beauty services tailored for weddings and special events
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard 
                key={service.prodid}
                service={service}
                onClick={() => handleServiceClick(service.prodid)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No services available</p>
          </div>
        )}
        
        {featured && services.length > 0 && (
          <div className="mt-12 text-center">
            <ButtonCustom
              variant="outline"
              size="lg"
              onClick={() => navigate('/services')}
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

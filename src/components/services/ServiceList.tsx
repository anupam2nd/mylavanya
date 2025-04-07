
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, ArrowDownWideNarrow, ArrowUpWideNarrow, SortDesc } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "./ServiceCard";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ServiceListProps {
  featured?: boolean;
  categoryFilter?: string;
  sortOrder?: 'none' | 'asc' | 'desc';
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
}

const ServiceList = ({ featured = false, categoryFilter, sortOrder = 'none' }: ServiceListProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSortOrder, setLocalSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const navigate = useNavigate();
  
  // Sync the external sortOrder prop with local state
  useEffect(() => {
    if (sortOrder !== undefined) {
      setLocalSortOrder(sortOrder);
    }
  }, [sortOrder]);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching active services with filter:", categoryFilter);
        
        // Create a query to the PriceMST table and filter for active services only
        let query = supabase
          .from('PriceMST')
          .select('*')
          .eq('active', true); // Only fetch active services

        console.log('query', query);
        
        // Apply category filter if provided
        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('Category', categoryFilter);
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
        
        // Add detailed logging to debug the issue
        console.log("Active services fetched raw data:", data);
        
        if (!data || data.length === 0) {
          console.log("No active services found for the selected category. Check your Supabase data.");
          // Instead of setting an error, we'll just set services to an empty array
          setServices([]);
        } else {
          console.log("Services data structure example:", data[0]);
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
  }, [featured, categoryFilter]);
  
  const handleServiceClick = (serviceId: number) => {
    console.log("Navigating to service detail:", serviceId);
    navigate(`/services/${serviceId}`);
  };
  
  // Sort services based on price
  const sortedServices = [...services].sort((a, b) => {
    // Get the effective price (NetPayable or calculated price after discount)
    const getPriceAfterDiscount = (service: Service) => {
      if (service.NetPayable !== null && service.NetPayable !== undefined) {
        return service.NetPayable;
      }
      if (service.Discount) {
        return service.Price - (service.Price * service.Discount / 100);
      }
      return service.Price;
    };
    
    const priceA = getPriceAfterDiscount(a);
    const priceB = getPriceAfterDiscount(b);
    
    if (localSortOrder === 'asc') {
      return priceA - priceB; // Low to high
    } else if (localSortOrder === 'desc') {
      return priceB - priceA; // High to low
    }
    return 0; // No sorting
  });
  
  // Get the confirmed bookings count
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState(0);
  
  useEffect(() => {
    const fetchConfirmedBookingsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('BookMST')
          .select('*', { count: 'exact', head: true })
          .eq('Status', 'confirmed');
          
        if (error) {
          console.error("Error fetching confirmed bookings count:", error);
          return;
        }
        
        setConfirmedBookingsCount(count || 0);
      } catch (error) {
        console.error("Error in fetchConfirmedBookingsCount:", error);
      }
    };
    
    fetchConfirmedBookingsCount();
  }, []);
  
  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {featured ? "Our Featured Services" : "Browse All Services"}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Professional beauty services tailored for weddings and special events
            </p>
            {!featured && (
              <div className="mt-2 inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full">
                <span className="font-medium mr-1">{confirmedBookingsCount}</span> 
                <span>confirmed bookings</span>
              </div>
            )}
          </div>
          
          {!featured && !sortOrder && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-4 sm:mt-0">
                  <span className="mr-2">Sort by Price</span>
                  {localSortOrder === 'none' && <SortDesc className="h-4 w-4" />}
                  {localSortOrder === 'asc' && <ArrowUpWideNarrow className="h-4 w-4" />}
                  {localSortOrder === 'desc' && <ArrowDownWideNarrow className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocalSortOrder('none')}>
                  Default
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocalSortOrder('asc')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocalSortOrder('desc')}>
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
        ) : sortedServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedServices.map((service) => (
              <ServiceCard 
                key={service.prod_id}
                service={{
                  prodid: service.prod_id,
                  pname: service.ProductName || "Unnamed Service",
                  pprice: service.Price,
                  pdesc: service.Description,
                  discount: service.Discount,
                  netPayable: service.NetPayable,
                  services: service.Services,
                  subservice: service.Subservice
                }}
                onClick={() => handleServiceClick(service.prod_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600">No active services available for this category</p>
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different category or check if there are active services in the PriceMST table.
            </p>
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

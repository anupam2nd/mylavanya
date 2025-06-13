
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Service {
  prod_id: number;
  ProductName: string;
  Category: string;
  imageUrl: string;
  Price: number;
  Scheme: string;
  Discount: number | null;
  NetPayable: number | null;
}

interface CategoryGroup {
  category: string;
  services: Service[];
}

const MobileCategoryServices = () => {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('PriceMST')
          .select('prod_id, ProductName, Category, imageUrl, Price, Scheme, Discount, NetPayable')
          .eq('active', true)
          .not('imageUrl', 'is', null)
          .not('Category', 'is', null)
          .order('Category', { ascending: true });

        if (error) {
          console.error('Error fetching services:', error);
          return;
        }

        // Group services by category
        const grouped = data.reduce((acc: { [key: string]: Service[] }, service) => {
          const category = service.Category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(service);
          return acc;
        }, {});

        // Convert to array format
        const groupedArray = Object.entries(grouped).map(([category, services]) => ({
          category,
          services
        }));

        setCategoryGroups(groupedArray);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (category: string) => {
    navigate(`/services?category=${encodeURIComponent(category)}`);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-32" />
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-20 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No services available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categoryGroups.map((group) => (
        <div key={group.category} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground capitalize">
            {group.category} Services
          </h3>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3 pb-2">
              {group.services.map((service) => (
                <button
                  key={service.prod_id}
                  onClick={() => handleServiceClick(group.category)}
                  className="flex-shrink-0 group"
                >
                  <div className="w-24 space-y-2">
                    <div className="h-20 w-full rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
                      <img
                        src={service.imageUrl}
                        alt={service.ProductName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Service name */}
                    <p className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors duration-200 truncate">
                      {service.Scheme}
                    </p>
                    
                    {/* Pricing information */}
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        {service.NetPayable && service.NetPayable !== service.Price ? (
                          <>
                            <span className="text-xs font-semibold text-primary">
                              {formatPrice(service.NetPayable)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(service.Price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-primary">
                            {formatPrice(service.Price)}
                          </span>
                        )}
                      </div>
                      
                      {service.Discount && service.Discount > 0 && (
                        <div className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                          {service.Discount}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

export default MobileCategoryServices;

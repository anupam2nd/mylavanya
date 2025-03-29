
import { Package, Star, CheckCircle, ChevronDown, ChevronUp, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  ProductName: string;
  Qty: number;
  price: number;
  originalPrice?: number;
  Services?: string;
  Subservice?: string;
  Assignedto?: string;
  AssignedBY?: string;
  ArtistId?: number; // Added ArtistId field
}

interface ServicesListProps {
  services: Service[];
}

interface ArtistInfo {
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistPhno: number | null;
}

const ServicesList = ({ services }: ServicesListProps) => {
  // Track which services are expanded
  const [expandedServices, setExpandedServices] = useState<number[]>([]);
  const [descriptions, setDescriptions] = useState<{[key: string]: string}>({});
  const [artistInfo, setArtistInfo] = useState<{[key: string]: ArtistInfo | null}>({});

  const toggleService = (index: number) => {
    setExpandedServices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  // Fetch descriptions from PriceMST
  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const productNames = services.map(service => service.ProductName);
        
        if (productNames.length === 0) return;
        
        const { data, error } = await supabase
          .from("PriceMST")
          .select("ProductName, Description")
          .in("ProductName", productNames);
          
        if (error) {
          console.error("Error fetching descriptions:", error);
          return;
        }
        
        const descriptionsMap: {[key: string]: string} = {};
        data.forEach(item => {
          descriptionsMap[item.ProductName] = item.Description || "";
        });
        
        setDescriptions(descriptionsMap);
      } catch (error) {
        console.error("Error in fetching descriptions:", error);
      }
    };
    
    fetchDescriptions();
  }, [services]);

  // Fetch artist information using ArtistId
  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        // Get all assigned artist IDs
        const artistIds = services
          .map(service => service.ArtistId)
          .filter(id => id !== null && id !== undefined); // Filter out undefined or null values
        
        if (artistIds.length === 0) return;
        
        const { data, error } = await supabase
          .from("ArtistMST")
          .select("ArtistId, ArtistFirstName, ArtistLastName, ArtistPhno")
          .in("ArtistId", artistIds);
          
        if (error) {
          console.error("Error fetching artist info:", error);
          return;
        }
        
        const artistInfoMap: {[key: string]: ArtistInfo} = {};
        data.forEach(artist => {
          if (artist.ArtistId) {
            artistInfoMap[artist.ArtistId] = {
              ArtistFirstName: artist.ArtistFirstName,
              ArtistLastName: artist.ArtistLastName,
              ArtistPhno: artist.ArtistPhno
            };
          }
        });
        
        setArtistInfo(artistInfoMap);
      } catch (error) {
        console.error("Error in fetching artist info:", error);
      }
    };
    
    fetchArtistInfo();
  }, [services]);

  // Format service name as "Services - Subservice - ProductName"
  const formatServiceName = (service: Service) => {
    let parts = [];
    if (service.Services) parts.push(service.Services);
    if (service.Subservice) parts.push(service.Subservice);
    if (service.ProductName) parts.push(service.ProductName);
    
    // If we have no parts, just return the ProductName
    return parts.length > 0 ? parts.join(' - ') : service.ProductName;
  };

  // Function to get an icon based on the service name
  const getServiceIcon = (serviceName: string) => {
    const normalizedName = serviceName.toLowerCase();
    
    if (normalizedName.includes("premium") || normalizedName.includes("deluxe")) {
      return <Star className="text-amber-500" size={18} />;
    } else if (normalizedName.includes("package") || normalizedName.includes("bundle")) {
      return <Package className="text-primary" size={18} />;
    } else {
      return <CheckCircle className="text-emerald-500" size={18} />;
    }
  };

  // Determine background color based on service index
  const getCardColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-secondary/30 to-secondary/10",
      "bg-gradient-to-r from-primary/20 to-primary/5",
      "bg-gradient-to-r from-amber-100 to-amber-50"
    ];
    return colors[index % colors.length];
  };

  // Mask phone number - show only last 4 digits
  const maskPhoneNumber = (phone: number | null) => {
    if (!phone) return "Not available";
    const phoneStr = phone.toString();
    if (phoneStr.length <= 4) return phoneStr;
    return "XXXX-" + phoneStr.slice(-4);
  };

  // Get artist full name
  const getArtistName = (artistId: number | undefined) => {
    if (!artistId || !artistInfo[artistId]) return "Not assigned";
    
    const artist = artistInfo[artistId];
    const firstName = artist?.ArtistFirstName || "";
    const lastName = artist?.ArtistLastName || "";
    
    return firstName + (lastName ? ` ${lastName}` : "");
  };

  return (
    <div className="col-span-2 mt-4 border-t pt-4">
      <p className="text-sm font-medium text-gray-500 mb-3 flex items-center">
        <Package size={16} className="mr-2 text-primary" />
        Services
      </p>
      <div className="space-y-3">
        {services.map((service, index) => {
          const isExpanded = expandedServices.includes(index);
          const formattedName = formatServiceName(service);
          const hasDiscount = service.originalPrice && service.originalPrice > service.price;
          const description = descriptions[service.ProductName] || "No description available";
          const artistName = getArtistName(service.ArtistId);
          
          // Get artist phone using ArtistId
          const artistPhone = service.ArtistId ? 
            artistInfo[service.ArtistId]?.ArtistPhno : null;
          const maskedPhone = maskPhoneNumber(artistPhone);
          
          return (
            <Collapsible 
              key={index} 
              open={isExpanded}
              onOpenChange={() => toggleService(index)}
              className={cn(
                "p-4 rounded-md border shadow-sm transition-all hover:shadow-md",
                getCardColor(index)
              )}
            >
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-white shadow-sm mr-3">
                  {getServiceIcon(formattedName)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">{formattedName}</p>
                    <CollapsibleTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-white/50 transition-colors">
                        {isExpanded ? 
                          <ChevronUp size={16} className="text-gray-600" /> : 
                          <ChevronDown size={16} className="text-gray-600" />
                        }
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mt-2">
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-medium">{service.Qty || 1}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Price</p>
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-500 text-xs">₹{service.originalPrice?.toFixed(2)}</span>
                          <span className="font-medium text-primary">₹{service.price?.toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="font-medium">₹{service.price?.toFixed(2) || '0.00'}</p>
                      )}
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Total</p>
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-500 text-xs">
                            ₹{((service.Qty || 1) * (service.originalPrice || 0))?.toFixed(2)}
                          </span>
                          <span className="font-medium text-primary">
                            ₹{((service.Qty || 1) * service.price)?.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <p className="font-medium text-primary">
                          ₹{((service.Qty || 1) * service.price)?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <CollapsibleContent className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-white/70 rounded-md p-3">
                  <h4 className="font-medium text-sm mb-2">Service Details</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">Service ID</dt>
                      <dd className="font-medium">SVC-{1000 + index}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Category</dt>
                      <dd className="font-medium">
                        {service.Services || 
                          (formattedName.includes("Premium") ? "Premium" : 
                          formattedName.includes("Package") ? "Package" : "Standard")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Assigned Artist</dt>
                      <dd className="font-medium flex items-center">
                        <User size={14} className="mr-1 text-primary opacity-70" />
                        {artistName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Artist Contact</dt>
                      <dd className="font-medium flex items-center">
                        <Phone size={14} className="mr-1 text-primary opacity-70" />
                        {maskedPhone}
                      </dd>
                    </div>
                    <div className="col-span-2 mt-2">
                      <dt className="text-xs text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-600 mt-1">
                        {description}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesList;

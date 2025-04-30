
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ButtonCustom } from "@/components/ui/button-custom";

interface WishlistItem {
  id: number;
  service_id: number;
  user_id: string;
  created_at: string;
  service_name: string;
  service_price: number;
  service_category: string;
  service_description: string;
}

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching wishlist for user:", user.id);
        
        // Use the get_user_wishlist function to fetch wishlist items with service details
        const { data, error } = await supabase
          .rpc('get_user_wishlist', { user_uuid: user.id });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Wishlist data received:", data);
        setWishlistItems(data || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load your wishlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);
  
  const handleRemoveFromWishlist = async (itemId: number) => {
    if (!user) return;
    
    try {
      // Use the remove_from_wishlist function to delete the item
      const { error } = await supabase
        .rpc('remove_from_wishlist', { 
          wishlist_id_param: itemId, 
          user_id_param: user.id 
        });

      if (error) throw error;
      
      // Update local state to remove the item
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };
  
  const handleViewService = (serviceId: number) => {
    navigate(`/services/${serviceId}`);
  };

  if (loading) {
    return (
      <DashboardLayout title="Wishlist">
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground ml-2">Loading your wishlist...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    return (
      <DashboardLayout title="Wishlist">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Please log in to view your wishlist</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You need to be logged in to view and manage your wishlist items.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  if (wishlistItems.length === 0) {
    return (
      <DashboardLayout title="Wishlist">
        <Card>
          <CardHeader>
            <CardTitle>Your Wishlist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Browse our services and add items to your wishlist for easy access later.
            </p>
            <ButtonCustom 
              variant="primary-gradient" 
              className="mt-6"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </ButtonCustom>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wishlist">
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist ({wishlistItems.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">{item.service_name}</h3>
                      {item.service_category && (
                        <Badge variant="outline" className="mt-1">{item.service_category}</Badge>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <p className="text-primary font-medium my-2">
                    ₹{item.service_price.toFixed(2)}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                    {item.service_description || "Professional beauty service for your special occasions"}
                  </p>
                  
                  <ButtonCustom 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={() => handleViewService(item.service_id)}
                  >
                    View Details
                  </ButtonCustom>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Wishlist;

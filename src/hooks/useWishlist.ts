
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  id: number;
  user_id: string;
  service_id: number;
  created_at: string;
  service_name: string;
  service_price?: number;
  service_category?: string;
  service_description?: string;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Using simpler join syntax that works with existing types
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          service_id,
          created_at,
          PriceMST:service_id (
            ProductName,
            Price,
            Category,
            Description
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
      }

      // Transform the data
      if (data) {
        const formattedItems = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          service_id: item.service_id,
          created_at: item.created_at,
          service_name: item.PriceMST?.ProductName || 'Unknown Service',
          service_price: item.PriceMST?.Price,
          service_category: item.PriceMST?.Category,
          service_description: item.PriceMST?.Description
        }));

        setWishlistItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (serviceId: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to add to wishlist");
      return false;
    }

    try {
      // Check if the item is already in the wishlist
      const existingItem = wishlistItems.find(item => item.service_id === serviceId);

      if (existingItem) {
        toast.info("This service is already in your wishlist");
        return true;
      }

      // Add to wishlist
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          service_id: serviceId
        });

      if (error) throw error;

      toast.success("Added to wishlist");
      fetchWishlist(); // Refresh the wishlist
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (wishlistItemId: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to manage your wishlist");
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Removed from wishlist");
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  };

  // Check if a service is in wishlist
  const isInWishlist = (serviceId: number) => {
    return wishlistItems.some(item => item.service_id === serviceId);
  };

  // Load wishlist on auth state change
  useEffect(() => {
    fetchWishlist();
  }, [user, isAuthenticated]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist
  };
};

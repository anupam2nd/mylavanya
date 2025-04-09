
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
      
      // Use rpc to work around TypeScript type issues with join queries
      const { data, error } = await supabase.rpc('get_user_wishlist', {
        user_uuid: user.id
      });

      if (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
      }

      // Set wishlist items if data exists
      if (data) {
        setWishlistItems(data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
      setWishlistItems([]);
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

      // Add to wishlist using RPC function
      const { error } = await supabase.rpc('add_to_wishlist', {
        service_id_param: serviceId,
        user_id_param: user.id
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
      // Remove from wishlist using RPC function
      const { error } = await supabase.rpc('remove_from_wishlist', {
        wishlist_id_param: wishlistItemId,
        user_id_param: user.id
      });

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


import { useState, useEffect, useCallback } from "react";
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
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user ID from auth context - ensure it's a string
      const userId = user.id.toString();
      console.log("Fetching wishlist for user:", userId);
      
      // Direct query using TEXT user_id
      const response = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          service_id,
          created_at,
          PriceMST!inner (
            ProductName,
            Price,
            Category,
            Description
          )
        `)
        .eq('user_id', userId);
        
      if (response.error) {
        console.error("Error fetching wishlist:", response.error);
        throw response.error;
      }

      if (response.data) {
        // Transform data to match expected format
        const transformedData = response.data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          service_id: item.service_id,
          created_at: item.created_at,
          service_name: item.PriceMST?.ProductName || '',
          service_price: item.PriceMST?.Price,
          service_category: item.PriceMST?.Category,
          service_description: item.PriceMST?.Description
        }));
        
        console.log("Wishlist data received:", transformedData);
        setWishlistItems(transformedData);
      } else {
        console.log("No wishlist data received");
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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

      // Convert user ID to string to ensure compatibility with TEXT column type
      const userId = user.id.toString();
      console.log("Adding to wishlist for user:", userId, "service:", serviceId);
      
      // Insert with TEXT user_id
      const response = await supabase
        .from('wishlist')
        .insert([
          { service_id: serviceId, user_id: userId }
        ]);
        
      if (response.error) {
        console.error("Error in addToWishlist:", response.error);
        throw response.error;
      }

      await fetchWishlist(); // Use await to ensure the wishlist is updated before showing success
      toast.success("Added to wishlist");
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
      // Convert user ID to string for compatibility with TEXT column type
      const userId = user.id.toString();
      console.log("Removing from wishlist for user:", userId, "item:", wishlistItemId);
      
      // Delete with TEXT user_id
      const response = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', userId);
        
      if (response.error) {
        console.error("Error in removeFromWishlist:", response.error);
        throw response.error;
      }

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      toast.success("Removed from wishlist");
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
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user, isAuthenticated, fetchWishlist]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist
  };
};

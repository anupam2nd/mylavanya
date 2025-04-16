import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  id: number;
  user_id: string;
  service_id: string;
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

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const userId = user.id;
      console.log("Fetching wishlist for user:", userId);
      
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

  const addToWishlist = async (serviceId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to add to wishlist");
      return false;
    }

    try {
      const existingItem = wishlistItems.find(item => item.service_id === serviceId);

      if (existingItem) {
        toast.info("This service is already in your wishlist");
        return true;
      }

      const userId = user.id;
      console.log("Adding to wishlist for user:", userId, "service:", serviceId);
      
      const response = await supabase
        .from('wishlist')
        .insert([
          { service_id: serviceId, user_id: userId }
        ]);
        
      if (response.error) {
        console.error("Error in addToWishlist:", response.error);
        throw response.error;
      }

      await fetchWishlist();
      toast.success("Added to wishlist");
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (wishlistItemId: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to manage your wishlist");
      return false;
    }

    try {
      const userId = user.id;
      console.log("Removing from wishlist for user:", userId, "item:", wishlistItemId);
      
      const response = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', userId);
        
      if (response.error) {
        console.error("Error in removeFromWishlist:", response.error);
        throw response.error;
      }

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      toast.success("Removed from wishlist");
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  };

  const isInWishlist = (serviceId: string) => {
    return wishlistItems.some(item => item.service_id === serviceId);
  };

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

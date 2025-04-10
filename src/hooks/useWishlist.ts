
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
      
      // Handle different user types (auth.users UUID or regular user with string ID)
      const userId = user.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      
      let data = null;
      let error = null;
      
      if (isUuid) {
        // User has UUID format ID (from auth.users)
        console.log("Fetching wishlist for UUID user:", userId);
        try {
          const response = await supabase.rpc(
            'get_user_wishlist',
            { user_uuid: userId }
          );
          
          data = response.data;
          error = response.error;
        } catch (rpcError) {
          console.error("RPC error:", rpcError);
          error = rpcError;
        }
      } else {
        // Regular user with string/numeric ID
        console.log("Fetching wishlist for regular user:", userId);
        // Use direct query for non-UUID users
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
          error = response.error;
        } else if (response.data) {
          // Transform data to match expected format
          data = response.data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            service_id: item.service_id,
            created_at: item.created_at,
            service_name: item.PriceMST?.ProductName || '',
            service_price: item.PriceMST?.Price,
            service_category: item.PriceMST?.Category,
            service_description: item.PriceMST?.Description
          }));
        }
      }

      if (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
      }

      // Set wishlist items if data exists
      if (data) {
        console.log("Wishlist data received:", data);
        setWishlistItems(data);
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

      const userId = user.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      let error = null;
      
      if (isUuid) {
        // Add to wishlist using RPC function for UUID users
        console.log("Adding to wishlist for UUID user:", userId, "service:", serviceId);
        try {
          const response = await supabase.rpc(
            'add_to_wishlist',
            {
              service_id_param: serviceId,
              user_id_param: userId
            }
          );
          
          error = response.error;
        } catch (rpcError) {
          console.error("RPC error:", rpcError);
          error = rpcError;
        }
      } else {
        // Direct insert for non-UUID users
        console.log("Adding to wishlist for regular user:", userId, "service:", serviceId);
        const response = await supabase
          .from('wishlist')
          .insert([
            { service_id: serviceId, user_id: userId }
          ]);
          
        error = response.error;
      }

      if (error) throw error;

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
      const userId = user.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      let error = null;
      
      if (isUuid) {
        // Remove from wishlist using RPC function for UUID users
        console.log("Removing from wishlist for UUID user:", userId, "item:", wishlistItemId);
        try {
          const response = await supabase.rpc(
            'remove_from_wishlist',
            {
              wishlist_id_param: wishlistItemId,
              user_id_param: userId
            }
          );
          
          error = response.error;
        } catch (rpcError) {
          console.error("RPC error:", rpcError);
          error = rpcError;
        }
      } else {
        // Direct delete for non-UUID users
        console.log("Removing from wishlist for regular user:", userId, "item:", wishlistItemId);
        const response = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItemId)
          .eq('user_id', userId);
          
        error = response.error;
      }

      if (error) throw error;

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
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
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

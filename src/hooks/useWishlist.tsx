
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useWishlist = (serviceId?: number) => {
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user || !serviceId) return;
      
      try {
        setWishlistLoading(true);
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id) // user.id is already a string/uuid
          .eq('service_id', serviceId)
          .maybeSingle();
          
        if (error) throw error;
        setIsInWishlist(!!data);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      } finally {
        setWishlistLoading(false);
      }
    };
    
    checkWishlistStatus();
  }, [isAuthenticated, user, serviceId]);
  
  const toggleWishlist = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    
    if (!user || !serviceId) return;
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Get the wishlist item id first
        const { data: wishlistItem, error: fetchError } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id) // user.id is already a string/uuid
          .eq('service_id', serviceId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItem.id)
          .eq('user_id', user.id);
          
        if (removeError) throw removeError;
        
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const { error: addError } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id, // user.id is already a string/uuid
            service_id: serviceId
          });
          
        if (addError) throw addError;
        
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("There was a problem updating your wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };
  
  // Method for adding and removing multiple items from wishlist
  const addToWishlist = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id, // user.id is already a string/uuid
          service_id: id
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  };
  
  const removeFromWishlist = async (id: number) => {
    if (!user) return;
    try {
      const { data: wishlistItem, error: fetchError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id) // user.id is already a string/uuid
        .eq('service_id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItem.id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  };

  return {
    isInWishlist,
    wishlistLoading,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist
  };
};

export default useWishlist;

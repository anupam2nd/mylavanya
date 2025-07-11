
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCustomToast } from "@/context/ToastContext";

export const useWishlist = (serviceId?: number) => {
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { showToast } = useCustomToast();

  // Check wishlist status when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user || !serviceId) return;
      
      // Get the member's ID from MemberMST table
      const { data: memberData, error: memberError } = await supabase
        .from('MemberMST')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (memberError || !memberData) {
        console.error("Error fetching member data:", memberError);
        return;
      }
      
      try {
        setWishlistLoading(true);
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', memberData.id)
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
      showToast("Please login to add items to your wishlist", "error");
      return;
    }
    
    if (!user || !serviceId) return;
    
    // Get the member's ID from MemberMST table
    const { data: memberData, error: memberError } = await supabase
      .from('MemberMST')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (memberError || !memberData) {
      console.error("Error fetching member data:", memberError);
      showToast("There was a problem updating your wishlist", "error");
      return;
    }
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Get the wishlist item id first
        const { data: wishlistItem, error: fetchError } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', memberData.id)
          .eq('service_id', serviceId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItem.id)
          .eq('user_id', memberData.id);
          
        if (removeError) throw removeError;
        
        setIsInWishlist(false);
        showToast("Removed from wishlist", "success");
      } else {
        // Add to wishlist
        const { error: addError } = await supabase
          .from('wishlist')
          .insert({
            user_id: memberData.id,
            service_id: serviceId
          });
          
        if (addError) throw addError;
        
        setIsInWishlist(true);
        showToast("Added to wishlist", "success");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToast("There was a problem updating your wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };
  
  // Method for adding and removing multiple items from wishlist
  const addToWishlist = async (id: number) => {
    if (!user) return;
    
    // Get the member's ID from MemberMST table
    const { data: memberData, error: memberError } = await supabase
      .from('MemberMST')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (memberError || !memberData) {
      console.error("Error fetching member data:", memberError);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: memberData.id,
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
    
    // Get the member's ID from MemberMST table
    const { data: memberData, error: memberError } = await supabase
      .from('MemberMST')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (memberError || !memberData) {
      console.error("Error fetching member data:", memberError);
      return false;
    }
    
    try {
      const { data: wishlistItem, error: fetchError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', memberData.id)
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

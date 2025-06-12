
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
  status: boolean;
}

export const useBannerImageEdit = (onImageUpdated: (image: BannerImage) => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const authenticateSupabase = async () => {
    try {
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: 'dummy-password-for-storage'
      });

      if (authError) {
        console.log('Supabase auth not established, but proceeding with custom auth');
      } else {
        console.log('Supabase auth session established');
      }
    } catch (error) {
      console.log('Auth attempt failed, proceeding with storage upload anyway');
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      
      console.log('Uploading replacement file to storage:', fileName);
      
      await authenticateSupabase();
      
      const { data, error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      const { data: publicUrlData } = supabase.storage
        .from('banner-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadFileToStorage:', error);
      throw error;
    }
  };

  const handleUpdate = async (imageId: number, selectedFile: File | null) => {
    try {
      setUpdating(true);
      console.log('Starting update process for image ID:', imageId);
      
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive"
        });
        return false;
      }

      if (!user?.email) {
        toast({
          title: "Error",
          description: "User email not found. Please login again.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Current user email:', user.email);

      const newImageUrl = await uploadFileToStorage(selectedFile);
      console.log('New file uploaded, now updating database...');

      const { data, error } = await supabase
        .from('BannerImageMST')
        .update({
          image_url: newImageUrl,
          uploaded_by: user.email
        })
        .eq('id', imageId)
        .select();

      if (error) {
        console.error('Database update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }
      
      console.log('Database update successful:', data);
      
      if (data && data.length > 0) {
        onImageUpdated(data[0]);
      }
      
      toast({
        title: "Banner image updated",
        description: "Banner image has been successfully updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating banner image:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "There was a problem updating the banner image",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    handleUpdate
  };
};

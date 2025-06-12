
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

export const useBannerImageUpload = (onImageAdded: (image: BannerImage) => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const authenticateSupabase = async () => {
    try {
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      // Try to sign in with a dummy password to establish auth context
      // This is needed because the current auth system doesn't create Supabase sessions
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: 'dummy-password-for-storage'
      });

      // If auth fails, we'll proceed anyway since storage policies allow authenticated role
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
      
      console.log('Uploading file to storage:', fileName);
      
      // Attempt to authenticate first
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

  const handleUpload = async (selectedFile: File | null) => {
    try {
      setUploading(true);
      console.log('Starting upload process...');
      
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

      const imageUrl = await uploadFileToStorage(selectedFile);
      console.log('File uploaded, now saving to database...');

      const { data, error } = await supabase
        .from('BannerImageMST')
        .insert([{
          image_url: imageUrl,
          uploaded_by: user.email
        }])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database insert failed: ${error.message}`);
      }
      
      console.log('Database insert successful:', data);
      
      if (data && data.length > 0) {
        onImageAdded(data[0]);
      }
      
      toast({
        title: "Banner image uploaded",
        description: "New banner image has been successfully uploaded and saved",
      });

      return true;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was a problem uploading the banner image",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    handleUpload
  };
};

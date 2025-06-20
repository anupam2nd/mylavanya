
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

interface DeleteBannerImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageToDelete: BannerImage | null;
  onImageDeleted: (imageId: number) => void;
}

const DeleteBannerImageDialog = ({ 
  open, 
  onOpenChange, 
  imageToDelete, 
  onImageDeleted 
}: DeleteBannerImageDialogProps) => {
  const { toast } = useToast();

  const extractFilePathFromUrl = (imageUrl: string): string | null => {
    try {
      // Extract the file path from the Supabase storage URL
      // Format: https://project.supabase.co/storage/v1/object/public/banner-images/filename
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('banner-images');
      
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        // Get everything after 'banner-images/'
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      // First, delete the file from storage
      const filePath = extractFilePathFromUrl(imageToDelete.image_url);
      
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('banner-images')
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Then delete the record from the database
      const { error: dbError } = await supabase
        .from('BannerImageMST')
        .delete()
        .eq('id', imageToDelete.id);

      if (dbError) throw dbError;

      onImageDeleted(imageToDelete.id);
      toast({
        title: "Banner image deleted",
        description: "The banner image and its file have been successfully removed",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting banner image:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the banner image",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the 
            banner image from both the database and storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBannerImageDialog;

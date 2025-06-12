
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

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const { error } = await supabase
        .from('BannerImageMST')
        .delete()
        .eq('id', imageToDelete.id);

      if (error) throw error;

      onImageDeleted(imageToDelete.id);
      toast({
        title: "Banner image deleted",
        description: "The banner image has been successfully removed",
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
            banner image from the system.
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

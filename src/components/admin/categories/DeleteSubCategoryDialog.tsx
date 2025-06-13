
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubCategory {
  sub_category_id: number;
  category_id: number;
  sub_category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    category_name: string;
  };
}

interface DeleteSubCategoryDialogProps {
  subCategory: SubCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteSubCategoryDialog = ({ subCategory, open, onOpenChange, onSuccess }: DeleteSubCategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!subCategory) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sub_categories')
        .delete()
        .eq('sub_category_id', subCategory.sub_category_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sub-category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Sub-Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the sub-category "{subCategory?.sub_category_name}"?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Sub-Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubCategoryDialog;

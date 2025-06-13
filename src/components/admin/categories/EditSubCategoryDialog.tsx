
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

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

interface EditSubCategoryDialogProps {
  subCategory: SubCategory | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditSubCategoryDialog = ({ subCategory, categories, open, onOpenChange, onSuccess }: EditSubCategoryDialogProps) => {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subCategory) {
      setSubCategoryName(subCategory.sub_category_name);
      setCategoryId(subCategory.category_id.toString());
      setDescription(subCategory.description || "");
    }
  }, [subCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategory || !subCategoryName.trim() || !categoryId) {
      toast({
        title: "Error",
        description: "Sub-category name and parent category are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sub_categories')
        .update({
          sub_category_name: subCategoryName.trim(),
          category_id: parseInt(categoryId),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('sub_category_id', subCategory.sub_category_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating sub-category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sub-category",
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
          <DialogTitle>Edit Sub-Category</DialogTitle>
          <DialogDescription>
            Update the sub-category information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="parentCategory">Parent Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id.toString()}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subCategoryName">Sub-Category Name *</Label>
              <Input
                id="subCategoryName"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Enter sub-category name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter sub-category description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Sub-Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubCategoryDialog;

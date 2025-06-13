
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EditSubCategoryDialog from "./EditSubCategoryDialog";
import DeleteSubCategoryDialog from "./DeleteSubCategoryDialog";

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

interface SubCategoriesTableProps {
  subCategories: SubCategory[];
  categories: Category[];
  loading: boolean;
  onRefresh: () => void;
}

const SubCategoriesTable = ({ subCategories, categories, loading, onRefresh }: SubCategoriesTableProps) => {
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (subCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sub-categories found</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sub-Category Name</TableHead>
            <TableHead>Parent Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subCategories.map((subCategory) => (
            <TableRow key={subCategory.sub_category_id}>
              <TableCell className="font-medium">
                {subCategory.sub_category_name}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {subCategory.categories?.category_name || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                {subCategory.description ? (
                  <span className="text-sm text-muted-foreground">
                    {subCategory.description.length > 50 
                      ? `${subCategory.description.substring(0, 50)}...` 
                      : subCategory.description
                    }
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">No description</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {formatDistanceToNow(new Date(subCategory.created_at), { addSuffix: true })}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSubCategory(subCategory)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingSubCategory(subCategory)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditSubCategoryDialog
        subCategory={editingSubCategory}
        categories={categories}
        open={!!editingSubCategory}
        onOpenChange={(open) => !open && setEditingSubCategory(null)}
        onSuccess={onRefresh}
      />

      <DeleteSubCategoryDialog
        subCategory={deletingSubCategory}
        open={!!deletingSubCategory}
        onOpenChange={(open) => !open && setDeletingSubCategory(null)}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default SubCategoriesTable;

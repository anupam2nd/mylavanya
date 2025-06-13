
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EditCategoryDialog from "./EditCategoryDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryWithCount extends Category {
  subCategoryCount: number;
}

interface CategoriesTableProps {
  categories: Category[];
  subCategoryCounts: CategoryWithCount[];
  loading: boolean;
  onRefresh: () => void;
}

const CategoriesTable = ({ categories, subCategoryCounts, loading, onRefresh }: CategoriesTableProps) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Sub-Categories</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const categoryWithCount = subCategoryCounts.find(c => c.category_id === category.category_id);
            const subCategoryCount = categoryWithCount?.subCategoryCount || 0;
            
            return (
              <TableRow key={category.category_id}>
                <TableCell className="font-medium">
                  {category.category_name}
                </TableCell>
                <TableCell>
                  {category.description ? (
                    <span className="text-sm text-muted-foreground">
                      {category.description.length > 50 
                        ? `${category.description.substring(0, 50)}...` 
                        : category.description
                      }
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No description</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={subCategoryCount > 0 ? "default" : "secondary"}>
                    {subCategoryCount} sub-categories
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {formatDistanceToNow(new Date(category.created_at), { addSuffix: true })}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSuccess={onRefresh}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default CategoriesTable;

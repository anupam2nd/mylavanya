
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import SubCategoriesTable from "@/components/admin/categories/SubCategoriesTable";
import AddCategoryDialog from "@/components/admin/categories/AddCategoryDialog";
import AddSubCategoryDialog from "@/components/admin/categories/AddSubCategoryDialog";

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

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddSubCategoryDialog, setShowAddSubCategoryDialog] = useState(false);
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const { data: subCategories = [], isLoading: subCategoriesLoading, refetch: refetchSubCategories } = useQuery({
    queryKey: ['sub_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select(`
          *,
          categories (
            category_name
          )
        `)
        .order('sub_category_name', { ascending: true });
      
      if (error) throw error;
      return data as SubCategory[];
    }
  });

  const filteredCategories = categories.filter(category =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.sub_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subCategory.description && subCategory.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subCategory.categories?.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    refetchCategories();
    refetchSubCategories();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Manage categories and sub-categories</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "categories"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("subcategories")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "subcategories"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sub-Categories
        </button>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            if (activeTab === "categories") {
              setShowAddCategoryDialog(true);
            } else {
              setShowAddSubCategoryDialog(true);
            }
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === "categories" ? "Category" : "Sub-Category"}
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "categories" ? "Categories" : "Sub-Categories"}
          </CardTitle>
          <CardDescription>
            {activeTab === "categories" 
              ? "Manage main service categories"
              : "Manage sub-categories within each main category"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "categories" ? (
            <CategoriesTable
              categories={filteredCategories}
              loading={categoriesLoading}
              onRefresh={handleRefresh}
            />
          ) : (
            <SubCategoriesTable
              subCategories={filteredSubCategories}
              categories={categories}
              loading={subCategoriesLoading}
              onRefresh={handleRefresh}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddCategoryDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        onSuccess={handleRefresh}
      />
      
      <AddSubCategoryDialog
        open={showAddSubCategoryDialog}
        onOpenChange={setShowAddSubCategoryDialog}
        categories={categories}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default AdminCategories;

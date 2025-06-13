
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ServiceList from "@/components/services/ServiceList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const Services = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  
  const { categories, subCategories, fetchSubCategories } = useCategories();

  // Get filtered sub-categories based on selected category
  const filteredSubCategories = selectedCategory && selectedCategory !== "all" 
    ? subCategories.filter(subCat => {
        const categoryObj = categories.find(cat => cat.category_name === selectedCategory);
        return categoryObj && subCat.category_id === categoryObj.category_id;
      })
    : [];

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const categoryObj = categories.find(cat => cat.category_name === selectedCategory);
      if (categoryObj) {
        fetchSubCategories(categoryObj.category_id);
      }
    }
  }, [selectedCategory, categories, fetchSubCategories]);

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all"); // Reset sub-category when category changes
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Services</h1>
          <p className="text-muted-foreground">
            Discover our comprehensive range of beauty and wellness services
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_name}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedSubCategory} 
            onValueChange={setSelectedSubCategory}
            disabled={selectedCategory === "all"}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={
                selectedCategory === "all" 
                  ? "Select category first" 
                  : "Select sub-category"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Categories</SelectItem>
              {filteredSubCategories.map((subCategory) => (
                <SelectItem key={subCategory.sub_category_id} value={subCategory.sub_category_name}>
                  {subCategory.sub_category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show category filter info for mobile users */}
        {categoryFromUrl && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Showing services for: {categoryFromUrl}
            </p>
          </div>
        )}

        <ServiceList 
          searchTerm={searchTerm} 
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
        />
      </div>
    </MainLayout>
  );
};

export default Services;

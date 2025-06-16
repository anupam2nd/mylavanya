
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ServiceList from "@/components/services/ServiceList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all");
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || "all");
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || "default");
  
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

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== "all") params.set('category', selectedCategory);
    if (selectedSubCategory !== "all") params.set('subCategory', selectedSubCategory);
    if (sortBy !== "default") params.set('sortBy', sortBy);
    
    // Update URL with search params
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedSubCategory, sortBy, setSearchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all"); // Reset sub-category when category changes
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSortBy("default");
    // Clear URL parameters
    setSearchParams({});
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price_low_to_high">Price: Low to High</SelectItem>
              <SelectItem value="price_high_to_low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {/* Show active filters info */}
        {(searchTerm || selectedCategory !== "all" || selectedSubCategory !== "all" || sortBy !== "default") && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Filters applied: 
              {searchTerm && ` Search: "${searchTerm}"`}
              {selectedCategory !== "all" && ` | Category: ${selectedCategory}`}
              {selectedSubCategory !== "all" && ` | Sub-category: ${selectedSubCategory}`}
              {sortBy !== "default" && ` | Sort: ${sortBy.replace('_', ' ')}`}
            </p>
          </div>
        )}

        <ServiceList 
          searchTerm={searchTerm} 
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          sortBy={sortBy}
        />
      </div>
    </MainLayout>
  );
};

export default Services;

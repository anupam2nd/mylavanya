
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useEffect } from "react";

interface ServiceDetailsFieldsProps {
  serviceName: string;
  subService: string;
  scheme: string;
  category: string;
  subCategory: string;
  serviceDescription: string;
  productName: string;
  onServiceNameChange: (value: string) => void;
  onSubServiceChange: (value: string) => void;
  onSchemeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const ServiceDetailsFields = ({
  serviceName,
  subService,
  scheme,
  category,
  subCategory,
  serviceDescription,
  productName,
  onServiceNameChange,
  onSubServiceChange,
  onSchemeChange,
  onCategoryChange,
  onSubCategoryChange,
  onDescriptionChange,
}: ServiceDetailsFieldsProps) => {
  const { categories, subCategories, loading, fetchSubCategories } = useCategories();

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (category) {
      const selectedCategory = categories.find(cat => cat.category_name === category);
      if (selectedCategory) {
        fetchSubCategories(selectedCategory.category_id);
      }
    } else {
      // Reset sub-categories if no category is selected
      fetchSubCategories();
    }
  }, [category, categories, fetchSubCategories]);

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value);
    // Reset sub-category when category changes
    onSubCategoryChange('');
  };

  // Get filtered sub-categories based on selected category
  const getFilteredSubCategories = () => {
    if (!category) return [];
    
    const selectedCategory = categories.find(cat => cat.category_name === category);
    if (!selectedCategory) return [];
    
    return subCategories.filter(subCat => subCat.category_id === selectedCategory.category_id);
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="service-name" className="text-right">
          Service Name*
        </Label>
        <Input
          id="service-name"
          value={serviceName}
          onChange={(e) => onServiceNameChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="sub-service" className="text-right">
          Sub-service
        </Label>
        <Input
          id="sub-service"
          value={subService}
          onChange={(e) => onSubServiceChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="scheme" className="text-right">
          Scheme
        </Label>
        <Input
          id="scheme"
          value={scheme}
          onChange={(e) => onSchemeChange(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Category
        </Label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select Category</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.category_id} value={cat.category_name}>
                {cat.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="sub-category" className="text-right">
          Sub Category
        </Label>
        <Select 
          value={subCategory} 
          onValueChange={onSubCategoryChange}
          disabled={!category || loading}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder={
              !category 
                ? "Select a category first" 
                : loading 
                ? "Loading..." 
                : "Select a sub category"
            } />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select Sub Category</SelectItem>
            {getFilteredSubCategories().map((subCat) => (
              <SelectItem key={subCat.sub_category_id} value={subCat.sub_category_name}>
                {subCat.sub_category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="product-name" className="text-right">
          Product Name
        </Label>
        <Input
          id="product-name"
          value={productName}
          className="col-span-3 bg-gray-100"
          disabled
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="service-description" className="text-right">
          Description
        </Label>
        <Textarea
          id="service-description"
          value={serviceDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="col-span-3"
          rows={3}
        />
      </div>
    </>
  );
};

export default ServiceDetailsFields;

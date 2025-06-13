
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceFiltersProps {
  searchQuery: string;
  activeFilter: string;
  categoryFilter: string;
  categories: string[];
  sortOrder: 'asc' | 'desc';
  onSearchChange: (query: string) => void;
  onActiveFilterChange: (filter: string) => void;
  onCategoryFilterChange: (category: string) => void;
  onSortChange: (sortOrder: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

const ServiceFilters = ({
  searchQuery,
  activeFilter,
  categoryFilter,
  categories,
  sortOrder,
  onSearchChange,
  onActiveFilterChange,
  onCategoryFilterChange,
  onSortChange,
  onClearFilters,
}: ServiceFiltersProps) => {
  const toggleSortOrder = () => {
    onSortChange(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortOrder === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select
        value={activeFilter}
        onValueChange={onActiveFilterChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="active">Active Services</SelectItem>
          <SelectItem value="inactive">Inactive Services</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={categoryFilter}
        onValueChange={onCategoryFilterChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={toggleSortOrder}
        className="flex items-center justify-center"
      >
        {getSortIcon()}
        <span className="ml-2">Sort by Date</span>
      </Button>

      <Button 
        variant="outline" 
        onClick={onClearFilters}
        className="flex items-center"
      >
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
};

export default ServiceFilters;

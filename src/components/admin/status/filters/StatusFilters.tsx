
import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  clearFilters: () => void;
}

const StatusFilters = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  clearFilters
}: StatusFiltersProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search status codes or names..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={activeFilter}
        onValueChange={setActiveFilter}
      >
        <SelectTrigger className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active Statuses</SelectItem>
          <SelectItem value="inactive">Inactive Statuses</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="flex items-center"
      >
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
};

export default StatusFilters;

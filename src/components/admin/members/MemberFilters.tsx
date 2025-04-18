
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MemberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onActiveFilterChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const MemberFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  onClearFilters,
  totalCount,
  filteredCount
}: MemberFiltersProps) => {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => onActiveFilterChange(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="all">All Members</option>
          <option value="active">Active Members</option>
          <option value="inactive">Inactive Members</option>
        </select>
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="flex items-center"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} members
      </div>
    </>
  );
};

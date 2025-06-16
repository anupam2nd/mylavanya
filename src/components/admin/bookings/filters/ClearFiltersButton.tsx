
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

interface ClearFiltersButtonProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  statusFilter: string;
  searchQuery: string;
  artistFilter: string;
  clearFilters: () => void;
}

export const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  startDate,
  endDate,
  statusFilter,
  searchQuery,
  artistFilter,
  clearFilters,
}) => {
  const hasActiveFilters = startDate || endDate || statusFilter !== "all" || searchQuery || (artistFilter && artistFilter !== "all");

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={clearFilters}
      className="h-9"
    >
      <FilterX className="mr-2 h-4 w-4" />
      Clear
    </Button>
  );
};

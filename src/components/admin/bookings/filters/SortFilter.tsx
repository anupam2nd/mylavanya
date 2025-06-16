
import { Button } from "@/components/ui/button";
import { ArrowDownUp } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { SortDirection, SortField } from "@/hooks/useBookingFilters";

interface SortFilterProps {
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={sortField === "creation_date" ? "bg-secondary" : ""}
          onClick={() => setSortField("creation_date")}
        >
          Creation date
        </DropdownMenuItem>
        <DropdownMenuItem
          className={sortField === "booking_date" ? "bg-secondary" : ""}
          onClick={() => setSortField("booking_date")}
        >
          Booking date
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={sortDirection === "desc" ? "bg-secondary" : ""}
          onClick={() => setSortDirection("desc")}
        >
          Newest first
        </DropdownMenuItem>
        <DropdownMenuItem
          className={sortDirection === "asc" ? "bg-secondary" : ""}
          onClick={() => setSortDirection("asc")}
        >
          Oldest first
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

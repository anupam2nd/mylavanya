
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { artistGroupOptions } from "@/types/artist";

interface ArtistFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  groupFilter: string;
  setGroupFilter: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  clearFilters: () => void;
}

export const ArtistFilters = ({
  searchQuery,
  setSearchQuery,
  groupFilter,
  setGroupFilter,
  activeFilter,
  setActiveFilter,
  clearFilters
}: ArtistFiltersProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={groupFilter}
        onValueChange={setGroupFilter}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Groups</SelectItem>
          {artistGroupOptions.map((group) => (
            <SelectItem key={group} value={group}>{group}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={activeFilter}
        onValueChange={setActiveFilter}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Artists</SelectItem>
          <SelectItem value="active">Active Artists</SelectItem>
          <SelectItem value="inactive">Inactive Artists</SelectItem>
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

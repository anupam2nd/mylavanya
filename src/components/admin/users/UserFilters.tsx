
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onClearFilters: () => void;
}

export const UserFilters = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  activeFilter,
  setActiveFilter,
  onClearFilters
}: UserFiltersProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">Users</SelectItem>
          <SelectItem value="admin">Admins</SelectItem>
          <SelectItem value="superadmin">Super Admins</SelectItem>
        </SelectContent>
      </Select>
      <Select value={activeFilter} onValueChange={setActiveFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="active">Active Users</SelectItem>
          <SelectItem value="inactive">Inactive Users</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onClearFilters} className="flex items-center">
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
};

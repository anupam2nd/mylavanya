
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/ui/export-button";
import { Member } from "@/types/member";
import { memberHeaders } from "@/types/member";
import { CalendarIcon, ChevronDown, Edit, FilePlus, MoreHorizontal, Search, Trash2, UserX } from "lucide-react";
import { format } from "date-fns";
import MemberFormDialog from "@/components/admin/members/MemberFormDialog";
import MemberViewDialog from "@/components/admin/members/MemberViewDialog";

interface MembersListViewProps {
  memberHook: ReturnType<typeof import("@/hooks/useMemberManagement").useMemberManagement>;
}

const MembersListView = ({ memberHook }: MembersListViewProps) => {
  const [viewMemberId, setViewMemberId] = useState<number | null>(null);
  const [editMemberId, setEditMemberId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = memberHook.paginatedMembers.map(member => member.id);
      memberHook.toggleSelectMember(...ids); // Spread the array into individual arguments
    } else {
      memberHook.selectedMembers.forEach(id => memberHook.toggleSelectMember(id));
    }
  };

  const renderPagination = () => {
    const { page, totalPages, goToPage } = memberHook;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i} 
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => goToPage(Math.max(1, page - 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage all members in your system
          </CardDescription>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={memberHook.searchQuery}
                onChange={(e) => memberHook.setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select 
              value={memberHook.activeFilter} 
              onValueChange={memberHook.setActiveFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={memberHook.clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
          
          {/* Bulk actions and export */}
          <div className="flex gap-2">
            {memberHook.selectedMembers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Actions for {memberHook.selectedMembers.length} members</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => memberHook.bulkToggleStatus(memberHook.selectedMembers, true)}>
                    Set Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => memberHook.bulkToggleStatus(memberHook.selectedMembers, false)}>
                    Set Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <ExportButton 
              data={memberHook.members}
              filename="members-export"
              headers={memberHeaders}
              buttonText="Export CSV"
            />
          </div>
        </div>
        
        {/* Members table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={memberHook.paginatedMembers.length > 0 && 
                      memberHook.selectedMembers.length === memberHook.paginatedMembers.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => memberHook.sortMembers('id')}
                >
                  ID {memberHook.sortConfig.column === 'id' && 
                      (memberHook.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => memberHook.sortMembers('MemberFirstName')}
                >
                  Name {memberHook.sortConfig.column === 'MemberFirstName' && 
                       (memberHook.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => memberHook.sortMembers('MemberEmailId')}
                >
                  Email {memberHook.sortConfig.column === 'MemberEmailId' && 
                       (memberHook.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => memberHook.sortMembers('MemberPhNo')}
                >
                  Phone {memberHook.sortConfig.column === 'MemberPhNo' && 
                        (memberHook.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => memberHook.sortMembers('Active')}
                >
                  Status {memberHook.sortConfig.column === 'Active' && 
                         (memberHook.sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberHook.loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : memberHook.paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No members found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                memberHook.paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox 
                        checked={memberHook.selectedMembers.includes(member.id)}
                        onCheckedChange={() => memberHook.toggleSelectMember(member.id)}
                      />
                    </TableCell>
                    <TableCell>{member.id}</TableCell>
                    <TableCell>
                      {member.MemberFirstName} {member.MemberLastName}
                    </TableCell>
                    <TableCell>{member.MemberEmailId}</TableCell>
                    <TableCell>{member.MemberPhNo}</TableCell>
                    <TableCell>
                      <Badge variant={member.Active ? "success" : "destructive"}>
                        {member.Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setViewMemberId(member.id)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditMemberId(member.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => memberHook.toggleStatus(member)}>
                              {member.Active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => memberHook.deleteMember(member)}
                              className="text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-muted-foreground mr-2">
            Rows per page:
          </span>
          <Select 
            value={memberHook.pageSize.toString()} 
            onValueChange={(value) => memberHook.changePageSize(parseInt(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          
          <span className="text-sm text-muted-foreground ml-4">
            Showing {memberHook.paginatedMembers.length} of {memberHook.totalMembers} members
          </span>
        </div>
        
        {renderPagination()}
      </CardFooter>
      
      {/* Member view dialog */}
      {viewMemberId !== null && (
        <MemberViewDialog 
          memberId={viewMemberId}
          onClose={() => setViewMemberId(null)}
          fetchMemberById={memberHook.fetchMemberById}
        />
      )}
      
      {/* Member edit dialog */}
      {editMemberId !== null && (
        <MemberFormDialog 
          memberId={editMemberId}
          onClose={() => setEditMemberId(null)}
          fetchMemberById={memberHook.fetchMemberById}
          onSave={memberHook.updateMember}
          mode="edit"
        />
      )}
      
      {/* Create member dialog */}
      {showCreateDialog && (
        <MemberFormDialog 
          onClose={() => setShowCreateDialog(false)}
          onSave={memberHook.createMember}
          mode="create"
        />
      )}
    </Card>
  );
};

export default MembersListView;

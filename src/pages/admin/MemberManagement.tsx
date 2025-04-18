
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MemberFilters } from "@/components/admin/members/MemberFilters";
import { MembersTable } from "@/components/admin/members/MembersTable";
import { useMemberManagement } from "@/hooks/useMemberManagement";

const MemberManagement = () => {
  const {
    members,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    toggleStatus
  } = useMemberManagement();

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  return (
    <ProtectedRoute allowedRoles={["controller"]}>
      <DashboardLayout title="Member Management">
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onActiveFilterChange={setActiveFilter}
              onClearFilters={clearFilters}
              totalCount={members.length}
              filteredCount={members.length}
            />

            {loading ? (
              <div className="flex justify-center p-4">Loading members...</div>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No members match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <MembersTable
                members={members}
                onToggleStatus={toggleStatus}
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MemberManagement;

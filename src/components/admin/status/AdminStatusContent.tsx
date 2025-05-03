
import { StatusOption } from "@/hooks/useStatusOptions";
import StatusList from "./list";
import AddStatusForm from "./AddStatusForm";

interface AdminStatusContentProps {
  statuses: StatusOption[];
  filteredStatuses: StatusOption[];
  loading: boolean;
  showAddForm: boolean;
  onStatusAdded: () => void;
  isSuperAdmin: boolean;
}

const AdminStatusContent = ({
  statuses,
  filteredStatuses,
  loading,
  showAddForm,
  onStatusAdded,
  isSuperAdmin
}: AdminStatusContentProps) => {
  return (
    <>
      {showAddForm && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <AddStatusForm onStatusAdded={onStatusAdded} />
        </div>
      )}
      
      {loading ? (
        <div className="p-8 flex justify-center items-center">Loading...</div>
      ) : filteredStatuses.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center">
          No statuses match your filters. Try adjusting your search criteria.
        </p>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredStatuses.length} of {statuses.length} statuses
          </div>
          <StatusList 
            statuses={filteredStatuses} 
            onUpdate={onStatusAdded} 
            isSuperAdmin={isSuperAdmin} 
          />
        </>
      )}
    </>
  );
};

export default AdminStatusContent;

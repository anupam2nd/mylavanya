
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ArtistRequestsTable from "@/components/admin/artist-requests/ArtistRequestsTable";

export default function ControllerArtistRequests() {
  return (
    <DashboardLayout title="Artist Requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Artist Requests</h1>
        </div>
        <ArtistRequestsTable />
      </div>
    </DashboardLayout>
  );
}

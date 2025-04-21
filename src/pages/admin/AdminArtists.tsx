
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useArtistManagement } from "@/hooks/useArtistManagement";
import { ArtistFormDialog } from "@/components/admin/artists/ArtistFormDialog";
import { ArtistFilters } from "@/components/admin/artists/ArtistFilters";
import ArtistsTable from "@/components/admin/artists/ArtistsTable";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Artist } from "@/types/artist";

const AdminArtists = () => {
  const { user } = useAuth();
  const { artists, loading, toggleStatus, deleteArtist, setArtists } = useArtistManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);

  const isSuperAdmin = user?.role === 'superadmin';

  const handleEditArtist = (artist: Artist) => {
    setCurrentArtist(artist);
    setIsDialogOpen(true);
  };

  const handleSuccess = (updatedArtist: Artist) => {
    if (currentArtist) {
      setArtists(artists.map(a => a.ArtistId === updatedArtist.ArtistId ? updatedArtist : a));
    } else {
      setArtists([...artists, updatedArtist]);
    }
    setCurrentArtist(null);
    setIsDialogOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGroupFilter("all");
    setActiveFilter("all");
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = searchQuery === "" || 
      `${artist.ArtistFirstName} ${artist.ArtistLastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      artist.ArtistEmpCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = groupFilter === "all" || artist.Artistgrp === groupFilter;
    
    const matchesStatus = activeFilter === "all" || 
      (activeFilter === "active" ? artist.Active : !artist.Active);

    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Artist Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Artists List</CardTitle>
            <Button 
              onClick={() => {
                setCurrentArtist(null);
                setIsDialogOpen(true);
              }}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Artist
            </Button>
          </CardHeader>
          <CardContent>
            <ArtistFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              clearFilters={clearFilters}
            />

            {loading ? (
              <div className="flex justify-center p-4">Loading artists...</div>
            ) : (
              <ArtistsTable 
                artists={filteredArtists}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEditArtist}
                onDelete={deleteArtist}
                onToggleStatus={toggleStatus}
              />
            )}

            <ArtistFormDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              isNewArtist={!currentArtist}
              currentArtist={currentArtist}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminArtists;

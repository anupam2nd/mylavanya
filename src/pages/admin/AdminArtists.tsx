
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Artist, artistHeaders } from "@/types/artist";
import { useArtistManagement } from "@/hooks/useArtistManagement";
import { ArtistFilters } from "@/components/admin/artists/ArtistFilters";
import { ArtistFormDialog } from "@/components/admin/artists/ArtistFormDialog";
import { ArtistsTable } from "@/components/admin/artists/ArtistsTable";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminArtists = () => {
  const { user } = useAuth();
  const { artists, loading, toggleStatus, deleteArtist, setArtists } = useArtistManagement();
  
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isNewArtist, setIsNewArtist] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    let result = [...artists];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        artist => 
          (artist.ArtistFirstName && artist.ArtistFirstName.toLowerCase().includes(query)) ||
          (artist.ArtistLastName && artist.ArtistLastName.toLowerCase().includes(query)) ||
          (artist.ArtistEmpCode && artist.ArtistEmpCode.toLowerCase().includes(query))
      );
    }
    
    if (groupFilter !== "all") {
      result = result.filter(artist => artist.Artistgrp === groupFilter);
    }
    
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(artist => artist.Active === isActive);
    }
    
    setFilteredArtists(result);
  }, [artists, searchQuery, groupFilter, activeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setGroupFilter("all");
    setActiveFilter("all");
  };

  const handleAddNew = () => {
    setIsNewArtist(true);
    setCurrentArtist(null);
    setOpenDialog(true);
  };

  const handleEdit = (artist: Artist) => {
    setIsNewArtist(false);
    setCurrentArtist(artist);
    setOpenDialog(true);
  };

  const handleDelete = (artist: Artist) => {
    setArtistToDelete(artist);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!artistToDelete) return;
    const success = await deleteArtist(artistToDelete.ArtistId);
    if (success) {
      setOpenDeleteDialog(false);
    }
  };

  const handleFormSuccess = (artist: Artist) => {
    if (isNewArtist) {
      setArtists([...artists, artist]);
    } else {
      setArtists(artists.map(a => a.ArtistId === artist.ArtistId ? artist : a));
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Artist Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Artist Management</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <ExportButton
                data={filteredArtists}
                filename="artists"
                headers={artistHeaders}
                buttonText="Export Artists"
              />
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add New Artist
              </Button>
            </div>
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

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredArtists.length} of {artists.length} artists
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading artists...</div>
            ) : filteredArtists.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No artists match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <ArtistsTable
                artists={filteredArtists}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={toggleStatus}
              />
            )}
          </CardContent>
        </Card>

        <ArtistFormDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          isNewArtist={isNewArtist}
          currentArtist={currentArtist}
          onSuccess={handleFormSuccess}
        />

        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the artist. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminArtists;

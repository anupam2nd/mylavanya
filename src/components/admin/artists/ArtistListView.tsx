
import { useState, useEffect } from "react";
import { 
  Plus, FileText, Search, Filter, ArrowUp, ArrowDown
} from "lucide-react";
import { useArtistManagement } from "@/hooks/useArtistManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Artist } from "@/types/artist";
import ArtistsTable from "./ArtistsTable";
import ArtistFormDialog from "./ArtistDetailDialog";
import ArtistActivity from "./ArtistActivity";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

const ArtistListView = () => {
  const { artists, loading, toggleStatus, deleteArtist, setArtists } = useArtistManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'ArtistFirstName',
    direction: 'ascending'
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);

  // Filter artists based on search and filters
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = searchQuery === "" || 
      `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      artist.ArtistEmpCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.emailid?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = groupFilter === "all" || artist.Artistgrp === groupFilter;
    
    const matchesStatus = activeFilter === "all" || 
      (activeFilter === "active" ? artist.Active : !artist.Active);

    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Sort artists
  const sortedArtists = [...filteredArtists].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Artist];
    const bValue = b[sortConfig.key as keyof Artist];
    
    // Handle null values in comparison
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'ascending' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortConfig.direction === 'ascending'
        ? (aValue < bValue ? -1 : 1)
        : (bValue < aValue ? -1 : 1);
    }
  });

  // Pagination
  const paginatedArtists = sortedArtists.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(sortedArtists.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  const handleEditArtist = (artist: Artist) => {
    setCurrentArtist(artist);
    setIsFormDialogOpen(true);
  };

  const handleViewActivity = (artist: Artist) => {
    setCurrentArtist(artist);
    setIsActivityDialogOpen(true);
  };

  const handleAddArtist = () => {
    setCurrentArtist(null);
    setIsFormDialogOpen(true);
  };

  const handleSuccess = (updatedArtist: Artist) => {
    if (currentArtist) {
      setArtists(prevArtists => 
        prevArtists.map(a => a.ArtistId === updatedArtist.ArtistId ? updatedArtist : a)
      );
    } else {
      setArtists(prevArtists => [...prevArtists, updatedArtist]);
    }
    setIsFormDialogOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGroupFilter("all");
    setActiveFilter("all");
    setSortConfig({ key: 'ArtistFirstName', direction: 'ascending' });
  };

  const handleExportCsv = () => {
    exportToCsv(
      filteredArtists.map(artist => ({
        Name: `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`,
        Email: artist.emailid || '',
        Phone: artist.ArtistPhno || '',
        Group: artist.Artistgrp || '',
        Status: artist.Active ? 'Active' : 'Inactive',
        JoinDate: new Date(artist.created_at).toLocaleDateString()
      })),
      'artists-data'
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      filteredArtists.map(artist => ({
        Name: `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`,
        Email: artist.emailid || '',
        Phone: artist.ArtistPhno || '',
        Group: artist.Artistgrp || '',
        Status: artist.Active ? 'Active' : 'Inactive',
        JoinDate: new Date(artist.created_at).toLocaleDateString()
      })),
      'Artists Data',
      'artists-data'
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Artists Management</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportCsv}
            className="hidden md:flex"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPdf}
            className="hidden md:flex"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleAddArtist}>
            <Plus className="h-4 w-4 mr-2" />
            Add Artist
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-row gap-2">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="Mehendi">Mehendi</SelectItem>
                <SelectItem value="Makeup">Makeup</SelectItem>
                <SelectItem value="Hairstylist">Hairstylist</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Decorator">Decorator</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearFilters} className="md:w-auto">
              Reset
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border">
              <ArtistsTable 
                artists={paginatedArtists}
                onEdit={handleEditArtist}
                onDelete={deleteArtist}
                onToggleStatus={toggleStatus}
                onViewActivity={handleViewActivity}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(sortedArtists.length, (currentPage - 1) * pageSize + 1)} to {Math.min(sortedArtists.length, currentPage * pageSize)} of {sortedArtists.length} artists
              </div>
              
              <div className="flex items-center space-x-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Entries per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ArrowUp className="h-4 w-4 rotate-90" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // Show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Show 2 pages before and after the current page
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ArrowDown className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <ArtistFormDialog
        open={isFormDialogOpen} 
        onOpenChange={setIsFormDialogOpen}
        isNewArtist={!currentArtist}
        currentArtist={currentArtist}
        onSuccess={handleSuccess}
      />

      <ArtistActivity
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        artist={currentArtist}
      />
    </Card>
  );
};

export default ArtistListView;

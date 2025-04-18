
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Artist {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistEmpCode: string | null;
  Artistgrp: string | null;
  Active: boolean | null;
}

const AdminArtists = () => {
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('*')
          .order('ArtistFirstName', { ascending: true });

        if (error) throw error;
        setArtists(data || []);
        setFilteredArtists(data || []);
      } catch (error) {
        console.error('Error fetching artists:', error);
        toast({
          title: "Failed to load artists",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [toast]);

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
    
    setFilteredArtists(result);
  }, [artists, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Artist Management">
        <Card>
          <CardHeader>
            <CardTitle>Artists List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredArtists.length} of {artists.length} artists
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading artists...</div>
            ) : filteredArtists.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No artists match your search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArtists.map((artist) => (
                      <TableRow key={artist.ArtistId}>
                        <TableCell>{artist.ArtistEmpCode}</TableCell>
                        <TableCell>{artist.ArtistFirstName}</TableCell>
                        <TableCell>{artist.ArtistLastName}</TableCell>
                        <TableCell>{artist.Artistgrp}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            artist.Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {artist.Active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminArtists;

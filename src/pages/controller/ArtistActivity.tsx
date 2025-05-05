
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

// Define interfaces for the data we'll use
interface Artist {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistPhno: number | null;
  Artistgrp: string | null;
  Active: boolean | null;
  emailid: string;
}

interface ArtistActivity {
  total_assigned: number;
  total_completed: number;
  total_revenue: number;
}

interface ArtistActivityDetails {
  booking_no: string;
  booking_date: string;
  service_name: string;
  status: string;
  price: number;
}

const ArtistActivityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedArtistName, setSelectedArtistName] = useState<string>("");
  const [activityStats, setActivityStats] = useState<ArtistActivity | null>(null);
  const [activityDetails, setActivityDetails] = useState<ArtistActivityDetails[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch artists on component mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('*')
          .order('ArtistId', { ascending: true });

        if (error) throw error;
        
        setArtists(data || []);
        setFilteredArtists(data || []);
      } catch (error) {
        console.error('Error fetching artists:', error);
        toast({
          title: "Failed to load artists",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Filter artists based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArtists(artists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = artists.filter(
      artist => 
        (artist.ArtistFirstName?.toLowerCase().includes(query) || 
         artist.ArtistLastName?.toLowerCase().includes(query) ||
         artist.emailid?.toLowerCase().includes(query))
    );
    
    setFilteredArtists(filtered);
  }, [searchQuery, artists]);

  // Handle viewing artist activity
  const viewArtistActivity = async (artistId: number, artistName: string) => {
    setSelectedArtistId(artistId);
    setSelectedArtistName(artistName);
    setDetailsLoading(true);
    setIsDetailsOpen(true);
    
    try {
      // Fetch activity stats
      const { data: statsData, error: statsError } = await supabase
        .from('BookMST')
        .select('Status, price')
        .eq('ArtistId', artistId);
        
      if (statsError) throw statsError;
      
      // Calculate statistics
      const totalAssigned = statsData?.length || 0;
      const completed = statsData?.filter(booking => booking.Status === 'done') || [];
      const totalCompleted = completed.length;
      const totalRevenue = completed.reduce((sum, booking) => sum + (booking.price || 0), 0);
      
      setActivityStats({
        total_assigned: totalAssigned,
        total_completed: totalCompleted,
        total_revenue: totalRevenue
      });
      
      // Fetch detailed booking information
      const { data: detailsData, error: detailsError } = await supabase
        .from('BookMST')
        .select('Booking_NO, Booking_date, ServiceName, Status, price')
        .eq('ArtistId', artistId)
        .order('Booking_date', { ascending: false });
        
      if (detailsError) throw detailsError;
      
      setActivityDetails(detailsData?.map(booking => ({
        booking_no: booking.Booking_NO?.toString() || '',
        booking_date: booking.Booking_date || '',
        service_name: booking.ServiceName || '',
        status: booking.Status || '',
        price: booking.price || 0
      })) || []);
    } catch (error) {
      console.error('Error fetching artist activity:', error);
      toast({
        title: "Failed to load artist activity",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['controller']}>
      <DashboardLayout title="Artist Activity">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Artist Activity Tracking</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">Loading artists...</div>
            ) : filteredArtists.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No artists found. Try adjusting your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artist Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArtists.map((artist) => (
                      <TableRow key={artist.ArtistId}>
                        <TableCell className="font-medium">
                          {artist.ArtistFirstName} {artist.ArtistLastName}
                        </TableCell>
                        <TableCell>{artist.emailid}</TableCell>
                        <TableCell>{artist.Artistgrp || 'N/A'}</TableCell>
                        <TableCell>{artist.ArtistPhno || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            artist.Active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {artist.Active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewArtistActivity(
                              artist.ArtistId, 
                              `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim()
                            )}
                          >
                            View Activity
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Activity for {selectedArtistName}</DialogTitle>
              <DialogDescription>
                Performance metrics and service history
              </DialogDescription>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="py-8 text-center">Loading activity data...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{activityStats?.total_assigned || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Services Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{activityStats?.total_completed || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">₹{activityStats?.total_revenue.toFixed(2) || '0.00'}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-md">
                  <h3 className="font-medium px-4 py-2 border-b bg-muted/50">Service History</h3>
                  {activityDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activityDetails.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{detail.booking_no}</TableCell>
                              <TableCell>{detail.booking_date}</TableCell>
                              <TableCell>{detail.service_name}</TableCell>
                              <TableCell>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  detail.status === 'done' ? 'bg-green-100 text-green-800' :
                                  detail.status === 'confirmed' || detail.status === 'beautician_assigned' ? 'bg-blue-100 text-blue-800' :
                                  detail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {detail.status?.toUpperCase() || 'UNKNOWN'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{detail.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">No service history available</p>
                  )}
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistActivityPage;

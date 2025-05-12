
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
import { Search, Download } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
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
  artist_name: string;
}

// For export functionality
interface ArtistExportData {
  artist_id: number;
  artist_name: string;
  email: string;
  group: string;
  phone: string;
  status: string;
  total_assigned: number;
  total_completed: number;
  total_revenue: number;
  export_date: string; // Added this field for date filtering
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
  
  // Export data state
  const [artistsExportData, setArtistsExportData] = useState<ArtistExportData[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

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
        
        // Initialize export data with artist info
        await prepareExportData(data || []);
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

  // Fetch status mapping from statusmst table
  const [statusMapping, setStatusMapping] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchStatusMapping = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name');
        
        if (error) throw error;
        
        if (data) {
          const mapping: Record<string, string> = {};
          data.forEach(status => {
            mapping[status.status_code.toLowerCase()] = status.status_name;
            // Also add the status_name -> status_name mapping for direct comparisons
            mapping[status.status_name.toLowerCase()] = status.status_name;
          });
          setStatusMapping(mapping);
          console.log("Status mapping loaded:", mapping);
        }
      } catch (error) {
        console.error('Error fetching status mapping:', error);
      }
    };
    
    fetchStatusMapping();
  }, []);

  // Helper function to get the correct status name
  const getStatusName = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    return statusMapping[normalizedStatus] || status;
  };

  // Prepare export data for all artists
  const prepareExportData = async (artistsList: Artist[]) => {
    try {
      setExportLoading(true);
      
      const exportData: ArtistExportData[] = [];
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      
      // Process each artist to get their stats
      for (const artist of artistsList) {
        const { data: bookings, error } = await supabase
          .from('BookMST')
          .select('Status, price')
          .eq('ArtistId', artist.ArtistId);
          
        if (error) {
          console.error(`Error fetching bookings for artist ${artist.ArtistId}:`, error);
          continue;
        }
        
        // Calculate stats
        const totalAssigned = bookings?.length || 0;
        
        // Get status mappings for "completed" status
        const completeStatusCodes = Object.entries(statusMapping)
          .filter(([_, name]) => name.toLowerCase() === 'completed' || name.toLowerCase() === 'done')
          .map(([code]) => code);
          
        // Include both "completed" and legacy "done" status
        const completedStatuses = [...completeStatusCodes, 'completed', 'done', 'complete', 'DONE', 'COMPLETED', 'COMPLETE'];
        
        const completed = bookings?.filter(booking => {
          const status = booking.Status?.toLowerCase() || '';
          return completedStatuses.includes(status) || 
                 (statusMapping[status] && 
                  (statusMapping[status].toLowerCase() === 'completed' || 
                   statusMapping[status].toLowerCase() === 'done'));
        }) || [];
        
        const totalCompleted = completed.length;
        
        const totalRevenue = completed.reduce((sum, booking) => {
          const price = typeof booking.price === 'number' ? booking.price : 
                      (typeof booking.price === 'string' ? parseFloat(booking.price) : 0);
          return sum + price;
        }, 0);
        
        // Add to export data
        exportData.push({
          artist_id: artist.ArtistId,
          artist_name: `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim(),
          email: artist.emailid || '',
          group: artist.Artistgrp || 'N/A',
          phone: artist.ArtistPhno?.toString() || 'N/A',
          status: artist.Active ? 'Active' : 'Inactive',
          total_assigned: totalAssigned,
          total_completed: totalCompleted,
          total_revenue: totalRevenue,
          export_date: currentDate // Add the current date for filtering
        });
      }
      
      setArtistsExportData(exportData);
    } catch (error) {
      console.error('Error preparing export data:', error);
      toast({
        title: "Failed to prepare export data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

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
      
      // Get status mappings for "completed" status
      const completeStatusCodes = Object.entries(statusMapping)
        .filter(([_, name]) => name.toLowerCase() === 'completed' || name.toLowerCase() === 'done')
        .map(([code]) => code);
        
      // Include both "completed" and legacy "done" status
      const completedStatuses = [...completeStatusCodes, 'completed', 'done', 'complete', 'DONE', 'COMPLETED', 'COMPLETE'];
      
      const completed = statsData?.filter(booking => {
        const status = booking.Status?.toLowerCase() || '';
        return completedStatuses.includes(status) || 
               (statusMapping[status] && 
                (statusMapping[status].toLowerCase() === 'completed' || 
                 statusMapping[status].toLowerCase() === 'done'));
      }) || [];
      
      const totalCompleted = completed.length;
      
      // Fix: Ensure we're correctly summing the revenue from completed services
      const totalRevenue = completed.reduce((sum, booking) => {
        const price = typeof booking.price === 'number' ? booking.price : 
                     (typeof booking.price === 'string' ? parseFloat(booking.price) : 0);
        return sum + price;
      }, 0);
      
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
        price: typeof booking.price === 'number' ? booking.price : 
               (typeof booking.price === 'string' ? parseFloat(booking.price) : 0),
        artist_name: selectedArtistName // Add the artist name to each activity detail
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
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ExportButton 
                data={artistsExportData}
                filename="artist_activity_summary"
                dateField="export_date" // Using our new field for date filtering
                buttonText={exportLoading ? "Preparing..." : "Export Summary"}
                variant="outline"
                headers={{
                  artist_name: "Artist Name",
                  email: "Email",
                  group: "Group",
                  phone: "Phone",
                  status: "Status",
                  total_assigned: "Assigned",
                  total_completed: "Completed",
                  total_revenue: "Revenue (₹)"
                }}
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
                  <div className="flex justify-between items-center px-4 py-2 border-b bg-muted/50">
                    <h3 className="font-medium">Service History</h3>
                    <ExportButton 
                      data={activityDetails}
                      filename={`artist_${selectedArtistId}_activities`}
                      dateField="booking_date"
                      buttonText="Export History"
                      variant="outline"
                      headers={{
                        booking_no: "Booking No.",
                        booking_date: "Date",
                        service_name: "Service",
                        status: "Status",
                        price: "Amount",
                        artist_name: "Artist Name"
                      }}
                    />
                  </div>
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
                                  getStatusName(detail.status).toLowerCase() === 'completed' || 
                                  getStatusName(detail.status).toLowerCase() === 'done' ? 'bg-green-100 text-green-800' :
                                  getStatusName(detail.status).toLowerCase() === 'confirmed' || 
                                  getStatusName(detail.status).toLowerCase() === 'beautician assigned' ? 'bg-blue-100 text-blue-800' :
                                  getStatusName(detail.status).toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {getStatusName(detail.status)?.toUpperCase() || 'UNKNOWN'}
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

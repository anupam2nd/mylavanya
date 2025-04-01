
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash2, Search, X } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { ExportButton } from "@/components/ui/export-button";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Artist {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistEmpCode: string | null;
  ArtistPhno: number | null;
  Artistgrp: string | null;
  Source: string | null;
  ArtistRating: number | null;
  Active: boolean | null;
}

const artistSchema = z.object({
  ArtistFirstName: z.string().min(1, "First name is required"),
  ArtistLastName: z.string().min(1, "Last name is required"),
  ArtistEmpCode: z.string().min(1, "Employee code is required"),
  ArtistPhno: z.string().refine(
    (val) => !isNaN(Number(val)) && val.length >= 10,
    { message: "Please enter a valid phone number" }
  ),
  Artistgrp: z.string().min(1, "Artist group is required"),
  Source: z.string().optional(),
  ArtistRating: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5,
    { message: "Rating must be between 0 and 5" }
  ),
  Active: z.boolean().default(true)
});

type ArtistFormValues = z.infer<typeof artistSchema>;

const AdminArtists = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isNewArtist, setIsNewArtist] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const isSuperAdmin = user?.role === 'superadmin';
  
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      ArtistFirstName: "",
      ArtistLastName: "",
      ArtistEmpCode: "",
      ArtistPhno: "",
      Artistgrp: "",
      Source: "",
      ArtistRating: "0",
      Active: true
    }
  });

  const artistHeaders = {
    ArtistId: 'ID',
    ArtistFirstName: 'First Name',
    ArtistLastName: 'Last Name',
    ArtistEmpCode: 'Employee Code',
    ArtistPhno: 'Phone Number',
    Artistgrp: 'Artist Group',
    Source: 'Source',
    ArtistRating: 'Rating',
    Active: 'Status'
  };

  const artistGroupOptions = [
    "Mehendi",
    "Makeup",
    "Hairstylist",
    "Photographer",
    "Decorator",
    "Other"
  ];

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
    form.reset({
      ArtistFirstName: "",
      ArtistLastName: "",
      ArtistEmpCode: "",
      ArtistPhno: "",
      Artistgrp: "",
      Source: "",
      ArtistRating: "0",
      Active: true
    });
    setOpenDialog(true);
  };

  const handleEdit = (artist: Artist) => {
    setIsNewArtist(false);
    setCurrentArtist(artist);
    form.reset({
      ArtistFirstName: artist.ArtistFirstName || "",
      ArtistLastName: artist.ArtistLastName || "",
      ArtistEmpCode: artist.ArtistEmpCode || "",
      ArtistPhno: artist.ArtistPhno ? String(artist.ArtistPhno) : "",
      Artistgrp: artist.Artistgrp || "",
      Source: artist.Source || "",
      ArtistRating: artist.ArtistRating ? String(artist.ArtistRating) : "0",
      Active: artist.Active === null ? true : artist.Active
    });
    setOpenDialog(true);
  };

  const handleDelete = (artist: Artist) => {
    setArtistToDelete(artist);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!artistToDelete) return;

    try {
      const { error } = await supabase
        .from('ArtistMST')
        .delete()
        .eq('ArtistId', artistToDelete.ArtistId);

      if (error) throw error;

      setArtists(artists.filter(a => a.ArtistId !== artistToDelete.ArtistId));
      toast({
        title: "Artist deleted",
        description: "The artist has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the artist",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (artist: Artist) => {
    try {
      const newActiveState = !artist.Active;
      const { error } = await supabase
        .from('ArtistMST')
        .update({ Active: newActiveState })
        .eq('ArtistId', artist.ArtistId);

      if (error) throw error;

      setArtists(artists.map(a => 
        a.ArtistId === artist.ArtistId 
          ? { ...a, Active: newActiveState } 
          : a
      ));
      
      toast({
        title: newActiveState ? "Artist activated" : "Artist deactivated",
        description: `Artist "${artist.ArtistFirstName} ${artist.ArtistLastName}" has been ${newActiveState ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error('Error updating artist active state:', error);
      toast({
        title: "Error",
        description: "Failed to update the artist",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ArtistFormValues) => {
    try {
      const artistData = {
        ArtistFirstName: values.ArtistFirstName,
        ArtistLastName: values.ArtistLastName,
        ArtistEmpCode: values.ArtistEmpCode,
        ArtistPhno: Number(values.ArtistPhno),
        Artistgrp: values.Artistgrp,
        Source: values.Source || null,
        ArtistRating: Number(values.ArtistRating),
        Active: values.Active
      };

      if (isNewArtist) {
        const { data, error } = await supabase
          .from('ArtistMST')
          .insert([artistData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setArtists([...artists, data[0]]);
        }
        
        toast({
          title: "Artist added",
          description: "New artist has been successfully added",
        });
      } else if (currentArtist) {
        const { error } = await supabase
          .from('ArtistMST')
          .update(artistData)
          .eq('ArtistId', currentArtist.ArtistId);

        if (error) throw error;

        setArtists(artists.map(artist => 
          artist.ArtistId === currentArtist.ArtistId 
            ? { ...artist, ...artistData } 
            : artist
        ));
        
        toast({
          title: "Artist updated",
          description: "Artist has been successfully updated",
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving artist:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the artist",
        variant: "destructive"
      });
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
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={groupFilter}
                onValueChange={setGroupFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {artistGroupOptions.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={activeFilter}
                onValueChange={setActiveFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  <SelectItem value="active">Active Artists</SelectItem>
                  <SelectItem value="inactive">Inactive Artists</SelectItem>
                </SelectContent>
              </Select>
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
                No artists match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Rating</TableHead>
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
                        <TableCell>{artist.ArtistEmpCode}</TableCell>
                        <TableCell>{artist.ArtistPhno}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {artist.Artistgrp || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {artist.ArtistRating !== null ? `${artist.ArtistRating}/5` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={artist.Active === true} 
                              onCheckedChange={() => toggleStatus(artist)}
                            />
                            <span className={artist.Active ? "text-green-600" : "text-red-600"}>
                              {artist.Active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(artist)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          
                          {isSuperAdmin && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(artist)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isNewArtist ? "Add New Artist" : "Edit Artist"}</DialogTitle>
              <DialogDescription>
                {isNewArtist 
                  ? "Add a new artist to the system." 
                  : "Make changes to the existing artist."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ArtistFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ArtistLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ArtistEmpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ArtistPhno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="Artistgrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Group</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {artistGroupOptions.map((group) => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="Source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ArtistRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="5" step="0.1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="Active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Is this artist currently active?
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">
                    {isNewArtist ? "Add Artist" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                artist and may affect existing bookings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
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


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
import { Plus, Trash2, Upload, ExternalLink } from "lucide-react";
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

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

const AdminBannerImages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<BannerImage | null>(null);
  
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const bannerHeaders = {
    id: 'ID',
    image_url: 'Image URL',
    uploaded_by: 'Uploaded By',
    created_at: 'Upload Date'
  };

  useEffect(() => {
    fetchBannerImages();
  }, []);

  const fetchBannerImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('BannerImageMST')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBannerImages(data || []);
    } catch (error) {
      console.error('Error fetching banner images:', error);
      toast({
        title: "Failed to load banner images",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setImageUrl("");
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(""); // Clear URL input when file is selected
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;
    
    // For now, we'll create a mock upload URL
    // In a real implementation, you'd upload to Supabase Storage or another service
    return `https://example.com/uploads/${fileName}`;
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      let finalImageUrl = imageUrl;
      
      if (selectedFile) {
        // Upload file and get URL
        finalImageUrl = await uploadFile(selectedFile);
      }

      if (!finalImageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL or select a file to upload",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('BannerImageMST')
        .insert([{
          image_url: finalImageUrl,
          uploaded_by: user?.email || 'Unknown'
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setBannerImages([data[0], ...bannerImages]);
      }
      
      toast({
        title: "Banner image added",
        description: "New banner image has been successfully added",
      });

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving banner image:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving the banner image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (image: BannerImage) => {
    setImageToDelete(image);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const { error } = await supabase
        .from('BannerImageMST')
        .delete()
        .eq('id', imageToDelete.id);

      if (error) throw error;

      setBannerImages(bannerImages.filter(img => img.id !== imageToDelete.id));
      toast({
        title: "Banner image deleted",
        description: "The banner image has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting banner image:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the banner image",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Banner Images Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Banner Images</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <ExportButton
                data={bannerImages}
                filename="banner-images"
                headers={bannerHeaders}
                buttonText="Export Images"
              />
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add Banner Image
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Total banner images: {bannerImages.length}
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading banner images...</div>
            ) : bannerImages.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No banner images found. Add your first banner image to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Image URL</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannerImages.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell className="font-medium">{image.id}</TableCell>
                        <TableCell>
                          <img 
                            src={image.image_url} 
                            alt="Banner preview" 
                            className="w-16 h-10 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs" title={image.image_url}>
                              {image.image_url}
                            </span>
                            <a 
                              href={image.image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>{image.uploaded_by}</TableCell>
                        <TableCell>{formatDate(image.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(image)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
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

        {/* Add Banner Image Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Banner Image</DialogTitle>
              <DialogDescription>
                Upload a new banner image by providing a URL or selecting a file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!selectedFile}
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={!!imageUrl}
                  />
                  {selectedFile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedFile(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {(imageUrl || selectedFile) && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg p-2">
                    <img 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleSave}
                disabled={uploading || (!imageUrl && !selectedFile)}
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Add Banner Image"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                banner image from the system.
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

export default AdminBannerImages;

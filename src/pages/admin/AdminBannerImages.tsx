
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
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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
    setSelectedFile(null);
    setPreviewUrl("");
    setOpenDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('banner-images')
      .upload(fileName, file);

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('banner-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive"
        });
        return;
      }

      // Upload file to Supabase storage
      const imageUrl = await uploadFileToStorage(selectedFile);

      const { data, error } = await supabase
        .from('BannerImageMST')
        .insert([{
          image_url: imageUrl,
          uploaded_by: user?.email || 'Unknown'
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setBannerImages([data[0], ...bannerImages]);
      }
      
      toast({
        title: "Banner image uploaded",
        description: "New banner image has been successfully uploaded and saved",
      });

      setOpenDialog(false);
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error('Error uploading banner image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading the banner image",
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

  // Clean up preview URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
              <DialogTitle>Upload New Banner Image</DialogTitle>
              <DialogDescription>
                Select an image file to upload as a banner image.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file-upload">Select Image File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                    <img 
                      src={previewUrl} 
                      alt="Upload preview" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleSave}
                disabled={uploading || !selectedFile}
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
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

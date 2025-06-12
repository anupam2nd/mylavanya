
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import BannerImagesHeader from "@/components/admin/banner-images/BannerImagesHeader";
import BannerImagesTable from "@/components/admin/banner-images/BannerImagesTable";
import AddBannerImageDialog from "@/components/admin/banner-images/AddBannerImageDialog";
import DeleteBannerImageDialog from "@/components/admin/banner-images/DeleteBannerImageDialog";
import { useToast } from "@/hooks/use-toast";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

const AdminBannerImages = () => {
  const { toast } = useToast();
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<BannerImage | null>(null);

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
    setOpenAddDialog(true);
  };

  const handleImageAdded = (newImage: BannerImage) => {
    setBannerImages([newImage, ...bannerImages]);
  };

  const handleDelete = (image: BannerImage) => {
    setImageToDelete(image);
    setOpenDeleteDialog(true);
  };

  const handleImageDeleted = (imageId: number) => {
    setBannerImages(bannerImages.filter(img => img.id !== imageId));
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Banner Images Management">
        <Card>
          <BannerImagesHeader 
            bannerImages={bannerImages}
            onAddNew={handleAddNew}
          />
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Total banner images: {bannerImages.length}
            </div>

            <BannerImagesTable
              bannerImages={bannerImages}
              onDelete={handleDelete}
              loading={loading}
            />
          </CardContent>
        </Card>

        <AddBannerImageDialog
          open={openAddDialog}
          onOpenChange={setOpenAddDialog}
          onImageAdded={handleImageAdded}
        />

        <DeleteBannerImageDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          imageToDelete={imageToDelete}
          onImageDeleted={handleImageDeleted}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminBannerImages;

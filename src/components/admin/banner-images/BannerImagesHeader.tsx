
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

interface BannerImagesHeaderProps {
  bannerImages: BannerImage[];
  onAddNew: () => void;
}

const BannerImagesHeader = ({ bannerImages, onAddNew }: BannerImagesHeaderProps) => {
  const bannerHeaders = {
    id: 'ID',
    image_url: 'Image URL',
    uploaded_by: 'Uploaded By',
    created_at: 'Upload Date'
  };

  return (
    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <CardTitle>Banner Images</CardTitle>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <ExportButton
          data={bannerImages}
          filename="banner-images"
          headers={bannerHeaders}
          buttonText="Export Images"
        />
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner Image
        </Button>
      </div>
    </CardHeader>
  );
};

export default BannerImagesHeader;

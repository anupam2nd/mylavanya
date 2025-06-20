
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, ExternalLink, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
  status: boolean;
}

interface BannerImagesTableProps {
  bannerImages: BannerImage[];
  onDelete: (image: BannerImage) => void;
  onEdit: (image: BannerImage) => void;
  onStatusUpdate: (imageId: number, newStatus: boolean) => void;
  loading: boolean;
}

const BannerImagesTable = ({ bannerImages, onDelete, onEdit, onStatusUpdate, loading }: BannerImagesTableProps) => {
  const { toast } = useToast();
  const [imageSizes, setImageSizes] = useState<Record<number, string>>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchImageSize = async (imageId: number, imageUrl: string) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10);
        setImageSizes(prev => ({
          ...prev,
          [imageId]: formatFileSize(sizeInBytes)
        }));
      } else {
        setImageSizes(prev => ({
          ...prev,
          [imageId]: 'Unknown'
        }));
      }
    } catch (error) {
      console.error('Error fetching image size:', error);
      setImageSizes(prev => ({
        ...prev,
        [imageId]: 'Error'
      }));
    }
  };

  useEffect(() => {
    // Fetch image sizes for all banner images
    bannerImages.forEach(image => {
      if (!imageSizes[image.id]) {
        fetchImageSize(image.id, image.image_url);
      }
    });
  }, [bannerImages]);

  const handleStatusToggle = async (imageId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('BannerImageMST')
        .update({ status: newStatus })
        .eq('id', imageId);

      if (error) {
        console.error('Error updating banner image status:', error);
        toast({
          title: "Failed to update status",
          description: "There was a problem updating the banner image status",
          variant: "destructive"
        });
        return;
      }

      onStatusUpdate(imageId, newStatus);
      
      toast({
        title: "Status updated",
        description: `Banner image ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating banner image status:', error);
      toast({
        title: "Failed to update status",
        description: "There was a problem updating the banner image status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading banner images...</div>;
  }

  if (bannerImages.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center">
        No banner images found. Add your first banner image to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Image URL</TableHead>
            <TableHead>Image Size</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>
                <span className="text-sm">
                  {imageSizes[image.id] || 'Loading...'}
                </span>
              </TableCell>
              <TableCell>{image.uploaded_by}</TableCell>
              <TableCell>{formatDate(image.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={image.status}
                    onCheckedChange={() => handleStatusToggle(image.id, image.status)}
                  />
                  <span className={`text-sm ${image.status ? 'text-green-600' : 'text-red-600'}`}>
                    {image.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(image)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(image)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BannerImagesTable;

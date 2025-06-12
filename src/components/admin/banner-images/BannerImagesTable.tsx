
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

interface BannerImagesTableProps {
  bannerImages: BannerImage[];
  onDelete: (image: BannerImage) => void;
  loading: boolean;
}

const BannerImagesTable = ({ bannerImages, onDelete, loading }: BannerImagesTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                  onClick={() => onDelete(image)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BannerImagesTable;

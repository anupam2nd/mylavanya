
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

interface AddBannerImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageAdded: (image: BannerImage) => void;
}

const AddBannerImageDialog = ({ open, onOpenChange, onImageAdded }: AddBannerImageDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to storage:', fileName);
      
      const { data, error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      const { data: publicUrlData } = supabase.storage
        .from('banner-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadFileToStorage:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      console.log('Starting upload process...');
      
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive"
        });
        return;
      }

      if (!user?.email) {
        toast({
          title: "Error",
          description: "User email not found. Please login again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Current user email:', user.email);

      const imageUrl = await uploadFileToStorage(selectedFile);
      console.log('File uploaded, now saving to database...');

      const { data, error } = await supabase
        .from('BannerImageMST')
        .insert([{
          image_url: imageUrl,
          uploaded_by: user.email
        }])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database insert failed: ${error.message}`);
      }
      
      console.log('Database insert successful:', data);
      
      if (data && data.length > 0) {
        onImageAdded(data[0]);
      }
      
      toast({
        title: "Banner image uploaded",
        description: "New banner image has been successfully uploaded and saved",
      });

      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error('Error uploading banner image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was a problem uploading the banner image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            onClick={handleClose}
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
  );
};

export default AddBannerImageDialog;

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
import { Upload } from "lucide-react";
import FileUploadSection from "./FileUploadSection";
import { useBannerImageUpload } from "@/hooks/useBannerImageUpload";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const { uploading, handleUpload } = useBannerImageUpload(onImageAdded);
  const MAX_FILE_SIZE = 150 * 1024; // 150KB in bytes

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Check file size before setting
      if (file.size > MAX_FILE_SIZE) {
        console.log('File too large:', file.size, 'bytes');
        setSelectedFile(null);
        setPreviewUrl("");
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    // Additional check before upload
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      return;
    }
    
    const success = await handleUpload(selectedFile);
    if (success) {
      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl("");
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

  const isFileTooLarge = selectedFile && selectedFile.size > MAX_FILE_SIZE;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Banner Image</DialogTitle>
          <DialogDescription>
            Select an image file to upload as a banner image. Maximum file size: 150KB.
          </DialogDescription>
        </DialogHeader>
        
        <FileUploadSection
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
        />
        
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
            disabled={uploading || !selectedFile || isFileTooLarge}
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

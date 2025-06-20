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
import { useBannerImageEdit } from "@/hooks/useBannerImageEdit";

interface BannerImage {
  id: number;
  image_url: string;
  uploaded_by: string;
  created_at: string;
  status: boolean;
}

interface EditBannerImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageToEdit: BannerImage | null;
  onImageUpdated: (image: BannerImage) => void;
}

const EditBannerImageDialog = ({ open, onOpenChange, imageToEdit, onImageUpdated }: EditBannerImageDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const { updating, handleUpdate } = useBannerImageEdit(onImageUpdated);
  const MAX_FILE_SIZE = 150 * 1024; // 150KB in bytes

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected for edit:', file.name, file.size, file.type);
      
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
    if (!imageToEdit) return;
    
    // Additional check before upload
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      return;
    }
    
    const success = await handleUpdate(imageToEdit.id, selectedFile);
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

  // Set current image as preview when dialog opens
  useEffect(() => {
    if (open && imageToEdit && !previewUrl) {
      setPreviewUrl(imageToEdit.image_url);
    }
  }, [open, imageToEdit]);

  const isFileTooLarge = selectedFile && selectedFile.size > MAX_FILE_SIZE;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Banner Image</DialogTitle>
          <DialogDescription>
            Select a new image file to replace the existing banner image. Maximum file size: 150KB.
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
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={updating || !selectedFile || isFileTooLarge}
          >
            {updating ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Update Image
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerImageDialog;


import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface FileUploadSectionProps {
  selectedFile: File | null;
  previewUrl: string;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection = ({ selectedFile, previewUrl, onFileSelect }: FileUploadSectionProps) => {
  const MAX_FILE_SIZE = 150 * 1024; // 150KB in bytes
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        // Clear the file input
        event.target.value = '';
        return;
      }
    }
    onFileSelect(event);
  };

  const isFileTooLarge = selectedFile && selectedFile.size > MAX_FILE_SIZE;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="file-upload">Select Image File</Label>
        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        
        <div className="text-sm text-muted-foreground">
          Maximum file size: 150KB
        </div>
        
        {selectedFile && !isFileTooLarge && (
          <div className="text-sm text-muted-foreground">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
        
        {isFileTooLarge && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              File size ({(selectedFile.size / 1024).toFixed(1)} KB) exceeds the 150KB limit. Please choose a smaller image.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {previewUrl && !isFileTooLarge && (
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
  );
};

export default FileUploadSection;

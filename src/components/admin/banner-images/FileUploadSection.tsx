
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileUploadSectionProps {
  selectedFile: File | null;
  previewUrl: string;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection = ({ selectedFile, previewUrl, onFileSelect }: FileUploadSectionProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="file-upload">Select Image File</Label>
        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={onFileSelect}
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
  );
};

export default FileUploadSection;


import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  imagePreview: string | null;
  imageError: string | null;
  onImageUpload: (file: File | null) => void;
  onRemoveImage: () => void;
}

const ImageUploader = ({
  imagePreview,
  imageError,
  onImageUpload,
  onRemoveImage,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageUpload(file);
  };

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="service-image" className="text-right pt-2">
        Service Image
      </Label>
      <div className="col-span-3">
        {imagePreview ? (
          <div className="mb-4 relative">
            <img 
              src={imagePreview} 
              alt="Service preview" 
              className="max-h-48 rounded-md border border-gray-200"
            />
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-center mb-1">
                Click to upload an image
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Max file size: 300KB. Max resolution: 800px<br />
                Accepted formats: JPEG, PNG, WebP
              </p>
              <Input
                id="service-image"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Image
              </Button>
            </div>
          </div>
        )}
        
        {!imagePreview && (
          <div className="mt-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full py-2 h-auto bg-pink-500 hover:bg-pink-600 text-white font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
            <p className="text-sm text-muted-foreground mt-1">No file chosen</p>
            <Input
              id="service-image-visible"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>
        )}
        
        {imageError && (
          <div className="text-red-500 text-xs mt-1">{imageError}</div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

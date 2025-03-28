
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  initialImage?: string;
  name: string;
  onImageChange: (imageUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

const AvatarUpload = ({ 
  initialImage, 
  name, 
  onImageChange, 
  size = "md" 
}: AvatarUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImage || "");
  const { toast } = useToast();
  
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <Avatar className={`${sizeClass[size]} ring-2 ring-background`}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={name} />
          ) : (
            <AvatarFallback>
              <User className="text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
          <label htmlFor={`avatar-upload-${name}`} className="text-xs text-white cursor-pointer font-medium w-full h-full flex items-center justify-center">
            Change
          </label>
        </div>
      </div>
      <Input 
        id={`avatar-upload-${name}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarUpload;

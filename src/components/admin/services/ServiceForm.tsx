
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface Service {
  prod_id: number;
  Services: string;
  ProductName: string | null;
  Description: string | null;
  Price: number;
  active?: boolean;
  Subservice?: string | null;
  Scheme?: string | null;
  Category?: string | null;
  Discount?: number | null;
  NetPayable?: number | null;
  imageUrl?: string | null;
}

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentService: Service | null;
  isNewService: boolean;
  onSave: (service: Service) => void;
  services: Service[];
}

const ServiceForm = ({
  open,
  onOpenChange,
  currentService,
  isNewService,
  onSave,
  services
}: ServiceFormProps) => {
  const { toast } = useToast();
  
  // Form state
  const [serviceName, setServiceName] = useState("");
  const [subService, setSubService] = useState("");
  const [scheme, setScheme] = useState("");
  const [category, setCategory] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [netPayable, setNetPayable] = useState("");
  const [priceFirst, setPriceFirst] = useState(true);
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set form values when current service changes
  useEffect(() => {
    if (!open) return;
    
    if (currentService) {
      setServiceName(currentService.Services || "");
      setSubService(currentService.Subservice || "");
      setScheme(currentService.Scheme || "");
      setCategory(currentService.Category || "");
      setServiceDescription(currentService.Description || "");
      setServicePrice(currentService.Price?.toString() || "");
      setDiscount(currentService.Discount?.toString() || "");
      setNetPayable(currentService.NetPayable?.toString() || "");
      setImagePreview(currentService.imageUrl || null);
    } else {
      resetForm();
    }
  }, [currentService, open]);

  const resetForm = () => {
    setServiceName("");
    setSubService("");
    setScheme("");
    setCategory("");
    setServiceDescription("");
    setServicePrice("");
    setDiscount("");
    setNetPayable("");
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    setPriceFirst(true);
  };

  const generateProductName = () => {
    const parts = [
      serviceName.trim(),
      subService.trim(),
      scheme.trim()
    ].filter(Boolean);
    
    return parts.join(' - ');
  };

  const handlePriceChange = (value: string) => {
    setServicePrice(value);
    if (priceFirst && discount) {
      // If price changes and we have discount, calculate net payable
      const price = parseFloat(value) || 0;
      const discountValue = parseFloat(discount) || 0;
      const calculatedNetPayable = price * (1 - discountValue / 100);
      setNetPayable(calculatedNetPayable.toFixed(2));
    }
  };

  const handleDiscountChange = (value: string) => {
    setDiscount(value);
    if (priceFirst && servicePrice) {
      // If discount changes and we have price, calculate net payable
      const price = parseFloat(servicePrice) || 0;
      const discountValue = parseFloat(value) || 0;
      const calculatedNetPayable = price * (1 - discountValue / 100);
      setNetPayable(calculatedNetPayable.toFixed(2));
    }
  };

  const handleNetPayableChange = (value: string) => {
    setNetPayable(value);
    if (!priceFirst && servicePrice) {
      // If net payable changes and we have price, calculate discount
      const price = parseFloat(servicePrice) || 0;
      const netPayableValue = parseFloat(value) || 0;
      if (price > 0) {
        const calculatedDiscount = ((price - netPayableValue) / price) * 100;
        setDiscount(calculatedDiscount.toFixed(2));
      }
    }
  };

  const toggleCalculationMode = () => {
    setPriceFirst(!priceFirst);
  };

  // Handle image upload with improved validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file size (300KB max)
    if (file.size > 300 * 1024) {
      setImageError("Image size must be less than 300KB");
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPEG, PNG and WEBP images are allowed");
      return;
    }
    
    // Create image element to check dimensions
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
      // Check image resolution
      if (img.width > 800 || img.height > 800) {
        setImageError("Image resolution should not exceed 800x800 pixels");
        return;
      }
      
      // Check aspect ratio (4:3) with some tolerance
      const aspectRatio = img.width / img.height;
      const targetRatio = 4/3;
      const tolerance = 0.1; // Allow some deviation from exact 4:3
      
      if (Math.abs(aspectRatio - targetRatio) > tolerance) {
        setImageError("Image should have approximately 4:3 aspect ratio");
        return;
      }
      
      // If all validations pass, set the image
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImageError("Invalid image file");
    };
    
    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      const priceValue = parseFloat(servicePrice);
      if (isNaN(priceValue)) {
        throw new Error("Price must be a valid number");
      }

      const productName = generateProductName();
      
      // Check if the ProductName already exists
      if (productName) {
        const { data, error } = await supabase
          .from('PriceMST')
          .select('prod_id')
          .eq('ProductName', productName);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0 && (!currentService || data[0].prod_id !== currentService.prod_id)) {
          throw new Error("A service with this combination of Service, Sub-service, and Scheme already exists");
        }
      }

      // Upload image if provided
      let imageUrl = currentService?.imageUrl || null;
      if (imageFile) {
        try {
          // Force fetch auth session to ensure token freshness
          const { data: sessionData } = await supabase.auth.getSession();
          
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('service-images')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          const { data: urlData } = supabase.storage
            .from('service-images')
            .getPublicUrl(fileName);
            
          imageUrl = urlData.publicUrl;
        } catch (uploadError) {
          toast({
            title: "Image upload failed",
            description: "There was a problem uploading the image, but we'll continue saving the service.",
            variant: "destructive"
          });
        }
      }

      const discountValue = parseFloat(discount) || 0;
      const netPayableValue = parseFloat(netPayable) || 0;

      // Create service object
      const serviceData: Partial<Service> = {
        Services: serviceName,
        Subservice: subService || null,
        Scheme: scheme || null,
        Category: category || null,
        ProductName: productName,
        Description: serviceDescription || null,
        Price: priceValue,
        Discount: discountValue || null,
        NetPayable: netPayableValue || null,
        imageUrl: imageUrl,
        active: true
      };

      onSave(serviceData as Service);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the service",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewService ? "Add New Service" : "Edit Service"}</DialogTitle>
          <DialogDescription>
            {isNewService 
              ? "Add a new service to your catalog." 
              : "Make changes to the existing service."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service-name" className="text-right">
              Service Name*
            </Label>
            <Input
              id="service-name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sub-service" className="text-right">
              Sub-service
            </Label>
            <Input
              id="sub-service"
              value={subService}
              onChange={(e) => setSubService(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheme" className="text-right">
              Scheme
            </Label>
            <Input
              id="scheme"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-name" className="text-right">
              Product Name
            </Label>
            <Input
              id="product-name"
              value={generateProductName()}
              className="col-span-3 bg-gray-100"
              disabled
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service-price" className="text-right">
              Price (₹)*
            </Label>
            <Input
              id="service-price"
              type="number"
              value={servicePrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right flex items-center justify-end">
              <Label htmlFor="calculation-mode" className="mr-2">
                Price first
              </Label>
              <Switch
                id="calculation-mode"
                checked={priceFirst}
                onCheckedChange={toggleCalculationMode}
              />
            </div>
            <div className="col-span-3 text-sm text-muted-foreground">
              {priceFirst 
                ? "Enter price and discount % to calculate net payable" 
                : "Enter price and net payable to calculate discount %"}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discount" className="text-right">
              Discount %
            </Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="net-payable" className="text-right">
              Net Payable (₹)
            </Label>
            <Input
              id="net-payable"
              type="number"
              value={netPayable}
              onChange={(e) => handleNetPayableChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          
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
                    className="max-h-36 rounded-md border border-gray-200"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
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
                      Max file size: 300KB. Max resolution: 800px (4:3 ratio)<br />
                      Accepted formats: JPEG, PNG, WebP
                    </p>
                    <Input
                      id="service-image"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
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
                    onChange={handleImageUpload}
                  />
                </div>
              )}
              
              {imageError && (
                <div className="text-red-500 text-xs mt-1">{imageError}</div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="service-description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={!serviceName || !servicePrice || !!imageError}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;

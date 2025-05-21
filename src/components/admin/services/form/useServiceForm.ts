
import { useState, useEffect } from "react";
import { Service } from "../ServiceForm";
import { supabase } from "@/integrations/supabase/client";

interface UseServiceFormProps {
  currentService: Service | null;
  isNewService: boolean;
  open: boolean;
  onSave: (service: Service) => void;
}

export const useServiceForm = ({
  currentService,
  isNewService,
  open,
  onSave
}: UseServiceFormProps) => {
  // Form state
  const [serviceName, setServiceName] = useState("");
  const [subService, setSubService] = useState("");
  const [scheme, setScheme] = useState("");
  const [category, setCategory] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [netPayable, setNetPayable] = useState("");
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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
  };

  const handleDiscountChange = (value: string) => {
    setDiscount(value);
  };

  const handleNetPayableChange = (value: string) => {
    setNetPayable(value);
  };

  const handleImageUpload = (file: File | null) => {
    setImageError(null);
    
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
          console.error('Upload error:', uploadError);
          throw new Error("Image upload failed");
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
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  return {
    serviceName,
    setServiceName,
    subService,
    setSubService,
    scheme,
    setScheme,
    category,
    setCategory,
    serviceDescription,
    setServiceDescription,
    servicePrice,
    discount,
    netPayable,
    imagePreview,
    imageError,
    generateProductName,
    handlePriceChange,
    handleDiscountChange,
    handleNetPayableChange,
    handleImageUpload,
    handleRemoveImage,
    handleSave,
    resetForm
  };
};

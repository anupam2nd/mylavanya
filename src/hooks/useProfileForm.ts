
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData, ChildDetail, JsonCompatible } from "@/types/profile";

export const useProfileForm = (
  initialData: ProfileFormData,
  userEmail: string,
  userRole?: string,
  userId?: string
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      const phoneNumber = digitsOnly.startsWith('91') ? digitsOnly.substring(2) : digitsOnly;
      
      setFormData(prev => ({ ...prev, [name]: phoneNumber }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBooleanChange = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset related fields when boolean switches are toggled off
    if (name === "maritalStatus" && !value) {
      setFormData(prev => ({ ...prev, spouseName: "" }));
    }
    
    if (name === "hasChildren" && !value) {
      setFormData(prev => ({ 
        ...prev, 
        numberOfChildren: 0,
        childrenDetails: []
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    if (name === "numberOfChildren") {
      // Limit to reasonable number (0-10)
      const boundedValue = Math.min(Math.max(numValue, 0), 10);
      
      setFormData(prev => {
        // Adjust children details array size
        let updatedChildrenDetails = [...(prev.childrenDetails || [])];
        
        // If increasing, add empty slots
        while (updatedChildrenDetails.length < boundedValue) {
          updatedChildrenDetails.push({ name: "", age: "" });
        }
        
        // If decreasing, remove extra slots
        if (updatedChildrenDetails.length > boundedValue) {
          updatedChildrenDetails = updatedChildrenDetails.slice(0, boundedValue);
        }
        
        return { 
          ...prev, 
          numberOfChildren: boundedValue,
          childrenDetails: updatedChildrenDetails
        };
      });
    }
  };

  const handleChildDetailChange = (index: number, field: 'name' | 'age', value: string) => {
    setFormData(prev => {
      const updatedChildren = [...(prev.childrenDetails || [])];
      updatedChildren[index] = { 
        ...updatedChildren[index], 
        [field]: value 
      };
      return { ...prev, childrenDetails: updatedChildren };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    
    setIsLoading(true);
    
    try {
      if (userRole === 'artist') {
        const artistId = parseInt(userId || '', 10);
        if (!isNaN(artistId)) {
          const { error } = await supabase
            .from('ArtistMST')
            .update({
              ArtistFirstName: formData.firstName,
              ArtistLastName: formData.lastName,
              ArtistPhno: formData.phone ? Number(formData.phone) : null,
              emailid: userEmail
            })
            .eq('ArtistId', artistId);
            
          if (error) throw error;
        }
      } 
      else if (userRole === 'member') {
        // Update member data in MemberMST with new fields
        const { error } = await supabase
          .from('MemberMST')
          .update({
            MemberFirstName: formData.firstName,
            MemberLastName: formData.lastName, 
            MemberPhNo: formData.phone || null,
            MaritalStatus: formData.maritalStatus || false,
            SpouseName: formData.spouseName || null,
            HasChildren: formData.hasChildren || false,
            NumberOfChildren: formData.numberOfChildren || 0,
            // Convert ChildrenDetails to JSON compatible format
            ChildrenDetails: formData.childrenDetails as JsonCompatible<ChildDetail[]>
          })
          .eq('MemberEmailId', userEmail);
          
        if (error) throw error;
      }
      else {
        // First try to update by Username
        const { error } = await supabase
          .from('UserMST')
          .update({
            FirstName: formData.firstName,
            LastName: formData.lastName,
            PhoneNo: formData.phone ? Number(formData.phone) : null
          })
          .eq('Username', userEmail);
          
        if (error) {
          console.error("Error updating by Username:", error);
          
          // Fallback to updating by ID
          const { error: idError } = await supabase
            .from('UserMST')
            .update({
              FirstName: formData.firstName,
              LastName: formData.lastName,
              PhoneNo: formData.phone ? Number(formData.phone) : null,
              Username: userEmail // Ensure Username is updated too
            })
            .eq('id', Number(userId));
            
          if (idError) throw idError;
        }
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleBooleanChange,
    handleNumberChange,
    handleChildDetailChange,
    handleSubmit
  };
};

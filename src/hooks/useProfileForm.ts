
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@/types/profile";

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

  const updateMemberProfile = async () => {
    // Convert children details to JSON string for database storage
    const childrenDetailsString = formData.childrenDetails && formData.childrenDetails.length > 0 
      ? JSON.stringify(formData.childrenDetails) 
      : null;
    
    // Direct table update with explicit type casting to avoid TypeScript complexity
    // @ts-ignore - Suppressing TypeScript "Type instantiation is excessively deep" error
    const { error } = await supabase
      .from('MemberMST')
      .update({
        MemberFirstName: formData.firstName,
        MemberLastName: formData.lastName,
        MemberPhNo: formData.phone,
        MaritalStatus: formData.maritalStatus,
        SpouseName: formData.spouseName,
        HasChildren: formData.hasChildren,
        NumberOfChildren: formData.numberOfChildren,
        ChildrenDetails: childrenDetailsString
      } as any)
      .eq('MemberEmailId', userEmail);
    
    return { error };
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
        const { error } = await updateMemberProfile();
        if (error) throw error;
      }
      else {
        // @ts-ignore - Suppressing TypeScript "Type instantiation is excessively deep" error
        const { error } = await supabase
          .from('UserMST')
          .update({
            FirstName: formData.firstName,
            LastName: formData.lastName,
            PhoneNo: formData.phone ? Number(formData.phone) : null
          } as any)
          .eq('Username', userEmail);
          
        if (error) {
          console.error("Error updating by Username:", error);
          
          // @ts-ignore - Suppressing TypeScript "Type instantiation is excessively deep" error
          const { error: idError } = await supabase
            .from('UserMST')
            .update({
              FirstName: formData.firstName,
              LastName: formData.lastName,
              PhoneNo: formData.phone ? Number(formData.phone) : null,
              Username: userEmail
            } as any)
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


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@/types/profile";

interface ProfileFormProps {
  initialData: ProfileFormData;
  userEmail: string;
  userRole?: string;
  userId?: string;
}

const ProfileForm = ({ initialData, userEmail, userRole, userId }: ProfileFormProps) => {
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
        // Update member data in MemberMST
        const { error } = await supabase
          .from('MemberMST')
          .update({
            MemberFirstName: formData.firstName,
            MemberLastName: formData.lastName, 
            MemberPhNo: formData.phone || null
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">UserID/Email Address</Label>
            <Input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                +91
              </div>
              <Input 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-12"
                placeholder="Enter your phone number"
              />
            </div>
            <p className="text-xs text-muted-foreground">Include your 10-digit phone number without the country code</p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

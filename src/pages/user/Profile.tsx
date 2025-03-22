
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  // Fetch existing profile data if available
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('UserMST')
          .select('FirstName, LastName, Username, PhoneNo')
          .eq('id', Number(user.id))
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            firstName: data.FirstName || "",
            lastName: data.LastName || "",
            phone: data.PhoneNo?.toString() || "" // Now using PhoneNo field
          }));
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      }
    };
    
    fetchProfileData();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If it's the phone field, strip the prefix for storage but keep it for display
    if (name === 'phone') {
      // Remove any non-digit characters for processing
      const digitsOnly = value.replace(/\D/g, '');
      
      // If it starts with India's code (91), remove it for storage
      const phoneNumber = digitsOnly.startsWith('91') ? digitsOnly.substring(2) : digitsOnly;
      
      setFormData(prev => ({ ...prev, [name]: phoneNumber }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Update the UserMST table with the new profile data
      const { error } = await supabase
        .from('UserMST')
        .upsert({
          id: Number(user.id),
          FirstName: formData.firstName,
          LastName: formData.lastName,
          PhoneNo: formData.phone ? Number(formData.phone) : null, // Now using PhoneNo field instead of Username
          Username: user.email // Keep email in Username field
        });
        
      if (error) throw error;
      
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

  // Format phone number for display with India's ISD code
  const displayPhoneNumber = formData.phone ? `+91 ${formData.phone}` : '';

  return (
    <ProtectedRoute>
      <DashboardLayout title="Profile">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;

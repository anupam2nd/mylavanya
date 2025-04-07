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
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Fetching profile data for user:", user);
        
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            const { data, error } = await supabase
              .from('ArtistMST')
              .select('ArtistFirstName, ArtistLastName, ArtistPhno')
              .eq('ArtistId', artistId)
              .single();
              
            if (error) {
              console.error("Error fetching artist profile:", error);
              return;
            }
            
            if (data) {
              setFormData(prev => ({
                ...prev,
                email: user?.email || "", 
                firstName: data.ArtistFirstName || "",
                lastName: data.ArtistLastName || "",
                phone: data.ArtistPhno?.toString() || ""
              }));
              console.log("Artist profile data loaded:", data);
            }
          }
        } 
        else if (user.role === 'member') {
          const memberId = parseInt(user.id, 10);
          if (!isNaN(memberId)) {
            const { data, error } = await supabase
              .from('MemberMST')
              .select('MemberFirstName, MemberLastName, MemberPhNo, MemberEmailId, MemberAdress, MemberPincode')
              .eq('id', memberId)
              .single();
              
            if (error) {
              console.error("Error fetching member profile:", error);
              return;
            }
            
            if (data) {
              setFormData(prev => ({
                ...prev,
                email: data.MemberEmailId || user?.email || "",
                firstName: data.MemberFirstName || "",
                lastName: data.MemberLastName || "",
                phone: data.MemberPhNo?.toString() || ""
              }));
              console.log("Member profile data loaded:", data);
            }
          }
        }
        else {
          const { data, error } = await supabase
            .from('UserMST')
            .select('FirstName, LastName, Username, PhoneNo')
            .eq('id', Number(user.id))
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }
          
          if (data) {
            setFormData(prev => ({
              ...prev,
              email: user?.email || "",
              firstName: data.FirstName || "",
              lastName: data.LastName || "",
              phone: data.PhoneNo?.toString() || ""
            }));
            console.log("User profile data loaded:", data);
          }
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      }
    };
    
    fetchProfileData();
  }, [user?.id, user?.email, user?.role, user?.firstName, user?.lastName]);

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
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      if (user.role === 'artist') {
        const artistId = parseInt(user.id, 10);
        if (!isNaN(artistId)) {
          const { error } = await supabase
            .from('ArtistMST')
            .update({
              ArtistFirstName: formData.firstName,
              ArtistLastName: formData.lastName,
              ArtistPhno: formData.phone ? Number(formData.phone) : null,
              emailid: user.email
            })
            .eq('ArtistId', artistId);
            
          if (error) throw error;
        }
      } 
      else if (user.role === 'member') {
        const memberId = parseInt(user.id, 10);
        if (!isNaN(memberId)) {
          const { error } = await supabase
            .from('MemberMST')
            .update({
              MemberFirstName: formData.firstName,
              MemberLastName: formData.lastName,
              MemberPhNo: formData.phone || null,
              MemberEmailId: formData.email
            })
            .eq('id', memberId);
            
          if (error) throw error;
        }
      }
      else {
        const { error } = await supabase
          .from('UserMST')
          .upsert({
            id: Number(user.id),
            FirstName: formData.firstName,
            LastName: formData.lastName,
            PhoneNo: formData.phone ? Number(formData.phone) : null,
            Username: user.email
          });
          
        if (error) throw error;
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
                      placeholder={user?.firstName || "Enter your first name"}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={user?.lastName || "Enter your last name"}
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

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData, ChildDetail } from "@/types/profile";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "sonner";

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
            ChildrenDetails: formData.childrenDetails || []
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

          {userRole === 'member' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                
                <div className="space-y-6">
                  {/* Marital Status Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="maritalStatus"
                          checked={formData.maritalStatus || false}
                          onCheckedChange={(checked) => handleBooleanChange("maritalStatus", checked)}
                        />
                        <span className="text-sm text-muted-foreground">{formData.maritalStatus ? 'Married' : 'Single'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Spouse Name - Conditionally shown */}
                  {formData.maritalStatus && (
                    <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                      <Label htmlFor="spouseName">Spouse Name</Label>
                      <Input 
                        id="spouseName"
                        name="spouseName"
                        value={formData.spouseName || ''}
                        onChange={handleChange}
                        placeholder="Enter your spouse's name"
                      />
                    </div>
                  )}
                  
                  {/* Children Information Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasChildren">Do you have children?</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="hasChildren"
                          checked={formData.hasChildren || false}
                          onCheckedChange={(checked) => handleBooleanChange("hasChildren", checked)}
                        />
                        <span className="text-sm text-muted-foreground">{formData.hasChildren ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Children Details - Conditionally shown */}
                  {formData.hasChildren && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="numberOfChildren">Number of Children</Label>
                        <Input
                          id="numberOfChildren"
                          name="numberOfChildren"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.numberOfChildren || 0}
                          onChange={handleNumberChange}
                          className="w-20"
                        />
                      </div>
                      
                      {/* Children Details Form Fields */}
                      {(formData.numberOfChildren || 0) > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Children Details</h4>
                          
                          {Array.from({ length: formData.numberOfChildren || 0 }).map((_, index) => (
                            <div key={index} className="p-3 border rounded-md space-y-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">Child {index + 1}</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label htmlFor={`child-${index}-name`}>Name</Label>
                                  <Input
                                    id={`child-${index}-name`}
                                    value={(formData.childrenDetails?.[index]?.name) || ''}
                                    onChange={(e) => handleChildDetailChange(index, 'name', e.target.value)}
                                    placeholder="Child's name"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`child-${index}-age`}>Age</Label>
                                  <Input
                                    id={`child-${index}-age`}
                                    value={(formData.childrenDetails?.[index]?.age) || ''}
                                    onChange={(e) => handleChildDetailChange(index, 'age', e.target.value)}
                                    placeholder="Child's age"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/types/profile";
import BasicInfoFields from "./BasicInfoFields";
import MaritalStatusFields from "./MaritalStatusFields";
import ChildrenFields from "./ChildrenFields";
import { useProfileForm } from "@/hooks/useProfileForm";

interface ProfileFormProps {
  initialData: ProfileFormData;
  userEmail: string;
  userRole?: string;
  userId?: string;
}

const ProfileForm = ({ initialData, userEmail, userRole, userId }: ProfileFormProps) => {
  const {
    formData,
    isLoading,
    handleChange,
    handleBooleanChange,
    handleNumberChange,
    handleChildDetailChange,
    handleSubmit
  } = useProfileForm(initialData, userEmail, userRole, userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BasicInfoFields 
            formData={formData} 
            handleChange={handleChange} 
          />

          {userRole === 'member' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              
              <MaritalStatusFields 
                formData={formData}
                handleChange={handleChange}
                handleBooleanChange={handleBooleanChange}
              />
              
              <div className="mt-6">
                <ChildrenFields 
                  formData={formData}
                  handleBooleanChange={handleBooleanChange}
                  handleNumberChange={handleNumberChange}
                  handleChildDetailChange={handleChildDetailChange}
                />
              </div>
            </div>
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

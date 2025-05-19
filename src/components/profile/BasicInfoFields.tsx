
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProfileFormData } from "@/types/profile";

interface BasicInfoFieldsProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoFields = ({ formData, handleChange }: BasicInfoFieldsProps) => {
  return (
    <>
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
    </>
  );
};

export default BasicInfoFields;


import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ProfileFormData } from "@/types/profile";

interface MaritalStatusFieldsProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBooleanChange: (name: string, value: boolean) => void;
}

const MaritalStatusFields = ({ 
  formData, 
  handleChange, 
  handleBooleanChange 
}: MaritalStatusFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <div className="flex items-center space-x-2">
            <Switch 
              id="maritalStatus"
              checked={formData.maritalStatus || false}
              onCheckedChange={(checked) => handleBooleanChange("maritalStatus", checked)}
            />
            <span className="text-sm text-muted-foreground">
              {formData.maritalStatus ? 'Married' : 'Single'}
            </span>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default MaritalStatusFields;

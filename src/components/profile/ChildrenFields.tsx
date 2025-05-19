
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ProfileFormData } from "@/types/profile";

interface ChildrenFieldsProps {
  formData: ProfileFormData;
  handleBooleanChange: (name: string, value: boolean) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChildDetailChange: (index: number, field: 'name' | 'age', value: string) => void;
}

const ChildrenFields = ({ 
  formData, 
  handleBooleanChange,
  handleNumberChange,
  handleChildDetailChange
}: ChildrenFieldsProps) => {
  return (
    <div className="space-y-6">
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
  );
};

export default ChildrenFields;

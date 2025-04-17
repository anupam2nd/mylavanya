
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemberFieldsProps {
  phone: string;
  address: string;
  pincode: string;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
}

export default function MemberFields({ 
  phone, 
  address, 
  pincode, 
  onPhoneChange,
  onAddressChange,
  onPincodeChange
}: MemberFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          type="tel" 
          placeholder="Your phone number" 
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          placeholder="Your address" 
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input 
          id="pincode" 
          placeholder="Your pincode" 
          value={pincode}
          onChange={(e) => onPincodeChange(e.target.value)}
          required
        />
      </div>
    </>
  );
}

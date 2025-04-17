
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export default function PersonalInfoFields({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange
}: PersonalInfoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input 
            id="first-name" 
            placeholder="First name" 
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input 
            id="last-name" 
            placeholder="Last name" 
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-register">
          Email <span className="text-xs text-muted-foreground">(This will be your login ID)</span>
        </Label>
        <Input 
          id="email-register" 
          type="email" 
          placeholder="Your email address" 
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </div>
    </>
  );
}

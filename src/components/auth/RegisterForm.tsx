
import { ButtonCustom } from "@/components/ui/button-custom";
import PersonalInfoFields from "./register/PersonalInfoFields";
import PasswordField from "./register/PasswordField";
import MemberFields from "./register/MemberFields";
import RegisterFormFooter from "./register/RegisterFormFooter";
import { useRegisterForm } from "./register/useRegisterForm";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
  userType?: string;
}

export default function RegisterForm({ onSuccess, userType = "member" }: RegisterFormProps) {
  const { 
    formData, 
    isLoading, 
    updateField, 
    handleRegister 
  } = useRegisterForm({ userType, onSuccess });
  
  const switchToLogin = () => {
    window.dispatchEvent(new CustomEvent('switchToLogin'));
  };
  
  return (
    <>
      <form onSubmit={handleRegister} className="space-y-4">
        <PersonalInfoFields 
          firstName={formData.firstName}
          lastName={formData.lastName}
          email={formData.email}
          onFirstNameChange={(value) => updateField('firstName', value)}
          onLastNameChange={(value) => updateField('lastName', value)}
          onEmailChange={(value) => updateField('email', value)}
        />
        
        <PasswordField 
          id="password-register"
          label="Password"
          value={formData.password}
          onChange={(value) => updateField('password', value)}
          placeholder="Create a password"
        />
        
        <PasswordField 
          id="confirm-password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          placeholder="Confirm your password"
        />
        
        {userType === "member" && (
          <MemberFields 
            phone={formData.phone}
            address={formData.address}
            pincode={formData.pincode}
            onPhoneChange={(value) => updateField('phone', value)}
            onAddressChange={(value) => updateField('address', value)}
            onPincodeChange={(value) => updateField('pincode', value)}
          />
        )}
        
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </ButtonCustom>
      </form>
      
      <RegisterFormFooter onSwitchToLogin={switchToLogin} />
    </>
  );
}

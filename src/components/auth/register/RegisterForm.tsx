
import { Form } from "@/components/ui/form";
import { ButtonCustom } from "@/components/ui/button-custom";
import PersonalInfoFields from "./PersonalInfoFields";
import ContactFields from "./ContactFields";
import AddressFields from "./AddressFields";
import DateOfBirthField from "./DateOfBirthField";
import PasswordFields from "./PasswordFields";
import { useRegisterForm } from "./useRegisterForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
  onSignInClick: () => void;
}

export default function RegisterForm({ onSuccess, onSignInClick }: RegisterFormProps) {
  const { form, isLoading, handleRegister } = useRegisterForm({ onSuccess });
  
  const onSubmit = form.handleSubmit((data) => {
    // OTP verification happens at the field level now
    handleRegister(data);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
        <PersonalInfoFields form={form} />
        <ContactFields form={form} />
        <AddressFields form={form} />
        <DateOfBirthField form={form} />
        <PasswordFields form={form} />
        
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </ButtonCustom>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={onSignInClick}
            >
              Sign in
            </Button>
          </p>
        </div>
      </form>
    </Form>
  );
}

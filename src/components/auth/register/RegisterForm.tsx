
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { registerFormSchema, type RegisterFormValues } from "./RegisterFormSchema";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
  onSignInClick: () => void;
}

export default function RegisterForm({ onSuccess, onSignInClick }: RegisterFormProps) {
  const { isSubmitting, handleSubmit } = useRegisterForm();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      address: "",
      pincode: "",
      sex: "Male",
      dob: undefined,
      isPhoneVerified: false,
    },
  });
  
  const onSubmit = form.handleSubmit((data) => {
    // Check if phone is verified before proceeding
    if (!data.isPhoneVerified) {
      toast.error("Please verify your phone number before creating an account");
      return;
    }
    
    // Transform data to match the expected RegisterFormValues interface for the hook
    const transformedData = {
      ...data,
      phone: data.phoneNumber, // Map phoneNumber to phone for the hook
      userType: "member", // Default user type
    };
    
    handleSubmit(transformedData).then(() => {
      onSuccess(data.email, data.password);
    });
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
        <PersonalInfoFields />
        <ContactFields />
        <AddressFields />
        <DateOfBirthField />
        <PasswordFields />
        
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
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

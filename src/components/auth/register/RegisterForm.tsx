
import { Form } from "@/components/ui/form";
import { ButtonCustom } from "@/components/ui/button-custom";
import PersonalInfoFields from "./PersonalInfoFields";
import ContactFields from "./ContactFields";
import AddressFields from "./AddressFields";
import DateOfBirthField from "./DateOfBirthField";
import PasswordFields from "./PasswordFields";
import { useRegisterForm } from "./useRegisterForm";
import { Button } from "@/components/ui/button";
import { useCustomToast } from "@/context/ToastContext";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterFormProps {
  onSuccess: (email: string, password: string) => void;
  onSignInClick: () => void;
}

export default function RegisterForm({ onSuccess, onSignInClick }: RegisterFormProps) {
  const { form, isLoading, handleRegister } = useRegisterForm({ onSuccess });
  const { showToast } = useCustomToast();
  
  const onSubmit = form.handleSubmit((data) => {
    // Check if phone is verified before proceeding
    if (!data.isPhoneVerified) {
      showToast("❌ Please verify your phone number before creating an account", 'error', 4000);
      return;
    }
    
    handleRegister(data);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
        <PersonalInfoFields />
        <ContactFields />
        <AddressFields />
        <DateOfBirthField />
        <PasswordFields />
        
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <p className="text-sm">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <ButtonCustom 
          variant="primary-gradient" 
          className="w-full"
          type="submit"
          disabled={isLoading || !form.watch('acceptTerms')}
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

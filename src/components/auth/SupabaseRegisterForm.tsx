
import RegisterForm from "./register/RegisterForm";

interface SupabaseRegisterFormProps {
  onSuccess: () => void;
  onSignInClick: () => void;
}

export default function SupabaseRegisterForm({ onSuccess, onSignInClick }: SupabaseRegisterFormProps) {
  const handleRegisterSuccess = (email: string, password: string) => {
    // Call the parent's success handler
    onSuccess();
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onSignInClick={onSignInClick}
    />
  );
}

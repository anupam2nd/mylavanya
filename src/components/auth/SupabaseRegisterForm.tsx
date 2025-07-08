
import RegisterForm from "./register/RegisterForm";

interface SupabaseRegisterFormProps {
  onSuccess: () => void;
  onSignInClick: () => void;
}

export default function SupabaseRegisterForm({ onSuccess, onSignInClick }: SupabaseRegisterFormProps) {
  const handleRegisterSuccess = (authEmail: string, password: string) => {
    // After successful registration, user is ready to login
    console.log('Registration successful for:', authEmail);
    onSuccess();
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onSignInClick={onSignInClick}
    />
  );
}


import RegisterForm from "./register/RegisterForm";

interface SupabaseRegisterFormProps {
  onSuccess: () => void;
  onSignInClick: () => void;
}

export default function SupabaseRegisterForm({ onSuccess, onSignInClick }: SupabaseRegisterFormProps) {
  const handleRegisterSuccess = (phone: string, password: string) => {
    // After successful registration, user needs to verify OTP
    // The onSuccess callback will be called after OTP verification
    console.log('Registration successful, awaiting OTP verification for:', phone);
    onSuccess();
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onSignInClick={onSignInClick}
    />
  );
}


import { Button } from "@/components/ui/button";

interface RegisterFormFooterProps {
  onSwitchToLogin: () => void;
}

export default function RegisterFormFooter({ onSwitchToLogin }: RegisterFormFooterProps) {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button 
          type="button" 
          variant="link" 
          className="p-0 h-auto"
          onClick={onSwitchToLogin}
        >
          Sign in
        </Button>
      </p>
    </div>
  );
}

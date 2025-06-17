
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useArtistLogin } from "@/hooks/useArtistLogin";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ArtistLoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleArtistLogin, loading, error } = useArtistLogin();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleArtistLogin(loginData.email, loginData.password);
    
    if (result && typeof result === 'object') {
      // Login successful
      login(result);
      toast.success("Artist login successful!");
    } else if (error) {
      toast.error(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-login">Email</Label>
        <Input 
          id="email-login" 
          type="email" 
          placeholder="Your artist email address" 
          value={loginData.email}
          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-login">Password</Label>
        <div className="relative">
          <Input 
            id="password-login" 
            type={showPassword ? "text" : "password"} 
            placeholder="Your password" 
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            required
            className="pr-10"
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <ButtonCustom 
        variant="primary-gradient" 
        className="w-full"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Artist Sign In"}
      </ButtonCustom>
    </form>
  );
}

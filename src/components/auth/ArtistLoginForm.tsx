
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useArtistLogin } from "@/hooks/useArtistLogin";

export default function ArtistLoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const { isLoading, handleLogin } = useArtistLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(loginData);
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
        <Input 
          id="password-login" 
          type="password" 
          placeholder="Your password" 
          value={loginData.password}
          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          required
        />
      </div>
      <ButtonCustom 
        variant="primary-gradient" 
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Artist Sign In"}
      </ButtonCustom>
    </form>
  );
}

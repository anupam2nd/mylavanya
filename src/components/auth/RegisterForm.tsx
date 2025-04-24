
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  sex: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    sex: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('MemberMST')
        .select('MemberEmailId')
        .eq('MemberEmailId', formData.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Insert new member
      const { error } = await supabase
        .from('MemberMST')
        .insert([
          {
            MemberFirstName: formData.firstName,
            MemberLastName: formData.lastName,
            MemberDOB: formData.dob,
            MemberPhNo: formData.phone,
            MemberEmailId: formData.email.toLowerCase(),
            MemberAdress: formData.address,
            MemberPincode: formData.pincode,
            MemberSex: formData.sex,
            password: formData.password,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "You can now sign in with your email and password",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
        pincode: "",
        sex: "",
        password: "",
        confirmPassword: ""
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          value={formData.pincode}
          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sex">Gender</Label>
        <select
          id="sex"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={formData.sex}
          onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>

      <ButtonCustom
        variant="primary-gradient"
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </ButtonCustom>
    </form>
  );
}

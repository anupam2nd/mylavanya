
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BookingFormValues, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const PersonalInfoFields = () => {
  const form = useFormContext<BookingFormValues>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch member info when component mounts if user is logged in
  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!user?.email || user.role !== 'member') return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('MemberMST')
          .select('MemberFirstName, MemberLastName, MemberEmailId, MemberPhNo, MemberAdress, MemberPincode')
          .eq('MemberEmailId', user.email)
          .single();
        
        if (error) {
          console.error("Error fetching member info:", error);
          return;
        }
        
        if (data) {
          // Construct full name from first and last name
          const fullName = [data.MemberFirstName, data.MemberLastName]
            .filter(Boolean)
            .join(' ');
            
          // Update form with member data
          form.setValue('name', fullName);
          form.setValue('email', data.MemberEmailId);
          form.setValue('phone', data.MemberPhNo || '');
          form.setValue('address', data.MemberAdress || '');
          form.setValue('pincode', data.MemberPincode || '');
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemberInfo();
  }, [user, form]);
  
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Full Name
              {requiredFields.name && <Asterisk className="h-3 w-3 text-red-500" />}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your full name" 
                {...field} 
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Email
                {requiredFields.email && <Asterisk className="h-3 w-3 text-red-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Phone Number
                {requiredFields.phone && <Asterisk className="h-3 w-3 text-red-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your phone number" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PersonalInfoFields;

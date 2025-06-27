
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Asterisk } from "lucide-react";

export default function PasswordFields() {
  const form = useFormContext<RegisterFormValues>();
  
  return (
    <>
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Password <Asterisk className="h-3 w-3 text-red-500" />
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="Create a password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Confirm Password <Asterisk className="h-3 w-3 text-red-500" />
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="Confirm your password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

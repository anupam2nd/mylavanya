
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { RegisterFormValues } from "./RegisterFormSchema";
import { Asterisk } from "lucide-react";

export default function PersonalInfoFields() {
  const form = useFormContext<RegisterFormValues>();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              First Name <Asterisk className="h-3 w-3 text-red-500" />
            </FormLabel>
            <FormControl>
              <Input placeholder="First name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Last Name <Asterisk className="h-3 w-3 text-red-500" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Last name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

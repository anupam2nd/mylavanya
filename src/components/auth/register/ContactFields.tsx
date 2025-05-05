
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./RegisterFormSchema";

interface ContactFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

export default function ContactFields({ form }: ContactFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-xs text-muted-foreground">(This will be your login ID)</span>
            </FormLabel>
            <FormControl>
              <Input type="email" placeholder="Your email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md">+91</span>
                <Input 
                  className="rounded-l-none" 
                  placeholder="10 digit number" 
                  maxLength={10} 
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}


import { useFormContext } from "react-hook-form";
import { BookingFormValues, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";

const AddressFields = () => {
  const form = useFormContext<BookingFormValues>();
  
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Address
              {requiredFields.address && <Asterisk className="h-3 w-3 text-red-500" />}
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pincode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Pincode
              {requiredFields.pincode && <Asterisk className="h-3 w-3 text-red-500" />}
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your pincode" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AddressFields;

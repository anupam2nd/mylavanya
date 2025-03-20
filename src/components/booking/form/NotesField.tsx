
import { useFormContext } from "react-hook-form";
import { BookingFormValues, requiredFields } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";

const NotesField = () => {
  const form = useFormContext<BookingFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            Special Requests 
            {requiredFields.notes && <Asterisk className="h-3 w-3 text-red-500" />}
            <span className="text-sm text-gray-500 ml-1">(Optional)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="Any special requests or notes" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;

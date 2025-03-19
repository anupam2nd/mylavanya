
import { useFormContext } from "react-hook-form";
import { BookingFormValues } from "./FormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const NotesField = () => {
  const form = useFormContext<BookingFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Special Requests (Optional)</FormLabel>
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

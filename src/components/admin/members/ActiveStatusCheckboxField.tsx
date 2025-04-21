
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";

export function ActiveStatusCheckboxField({ control }) {
  return (
    <FormField
      control={control}
      name="Active"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </FormControl>
          <FormLabel>Active Member</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

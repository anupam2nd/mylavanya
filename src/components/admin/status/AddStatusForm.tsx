
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  status_code: z.string().min(1, "Status code is required"),
  status_name: z.string().min(1, "Status name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStatusFormProps {
  onStatusAdded: () => void;
}

const AddStatusForm = ({ onStatusAdded }: AddStatusFormProps) => {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_code: "",
      status_name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Check if status code already exists
      const { data: existingStatus, error: checkError } = await supabase
        .from('statusmst')
        .select('status_code')
        .eq('status_code', values.status_code)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // An error occurred other than "no rows returned"
        throw checkError;
      }

      if (existingStatus) {
        form.setError('status_code', { 
          message: 'Status code already exists' 
        });
        return;
      }

      // Insert new status
      const { error } = await supabase
        .from('statusmst')
        .insert({
          status_code: values.status_code,
          status_name: values.status_name,
          description: values.description,
          active: true,
        });

      if (error) throw error;

      toast({
        title: "Status added",
        description: "New status has been added successfully",
      });

      form.reset();
      onStatusAdded();
    } catch (error) {
      console.error('Error adding status:', error);
      toast({
        title: "Error",
        description: "Failed to add new status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Status</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter status code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter status name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Add Status</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AddStatusForm;

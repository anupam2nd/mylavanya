
import { StatusOption } from "@/hooks/useStatusOptions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  status_code: z.string().min(1, "Status code is required"),
  status_name: z.string().min(1, "Status name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditStatusDialogProps {
  status: StatusOption | null;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

const EditStatusDialog = ({ status, onClose, onSubmit }: EditStatusDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_code: status?.status_code || "",
      status_name: status?.status_name || "",
      description: status?.description || "",
    },
  });

  // Reset form when status changes
  if (status && (
    form.getValues("status_code") !== status.status_code ||
    form.getValues("status_name") !== status.status_name ||
    form.getValues("description") !== (status.description || "")
  )) {
    form.reset({
      status_code: status.status_code,
      status_name: status.status_name,
      description: status.description || "",
    });
  }

  return (
    <Dialog open={!!status} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Code</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
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
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStatusDialog;

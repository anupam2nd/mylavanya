
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Member } from "@/types/member";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema
const memberFormSchema = z.object({
  MemberFirstName: z.string().min(2, { message: "First name is required" }),
  MemberLastName: z.string().min(2, { message: "Last name is required" }),
  MemberEmailId: z.string().email({ message: "Invalid email address" }).optional().nullable(),
  MemberPhNo: z.string().optional().nullable(),
  MemberAdress: z.string().optional().nullable(),
  MemberPincode: z.string().optional().nullable(),
  MemberDOB: z.date().optional().nullable(),
  MemberSex: z.enum(["male", "female", "other"]).optional().nullable(),
  Active: z.boolean().default(true),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

interface MemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Member>) => Promise<boolean>;
  member?: Member;
  title: string;
}

const MemberFormDialog = ({ open, onClose, onSubmit, member, title }: MemberFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values or existing member data
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: member
      ? {
          MemberFirstName: member.MemberFirstName || "",
          MemberLastName: member.MemberLastName || "",
          MemberEmailId: member.MemberEmailId || "",
          MemberPhNo: member.MemberPhNo || "",
          MemberAdress: member.MemberAdress || "",
          MemberPincode: member.MemberPincode || "",
          MemberDOB: member.MemberDOB ? new Date(member.MemberDOB) : null,
          MemberSex: member.MemberSex as "male" | "female" | "other" || null,
          Active: member.Active,
        }
      : {
          MemberFirstName: "",
          MemberLastName: "",
          MemberEmailId: "",
          MemberPhNo: "",
          MemberAdress: "",
          MemberPincode: "",
          MemberDOB: null,
          MemberSex: null,
          Active: true,
        },
  });

  // Reset form when member data changes
  useEffect(() => {
    if (member) {
      form.reset({
        MemberFirstName: member.MemberFirstName || "",
        MemberLastName: member.MemberLastName || "",
        MemberEmailId: member.MemberEmailId || "",
        MemberPhNo: member.MemberPhNo || "",
        MemberAdress: member.MemberAdress || "",
        MemberPincode: member.MemberPincode || "",
        MemberDOB: member.MemberDOB ? new Date(member.MemberDOB) : null,
        MemberSex: member.MemberSex as "male" | "female" | "other" || null,
        Active: member.Active,
      });
    }
  }, [member, form]);

  const handleSubmit = async (values: MemberFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert date object to string format expected by the API
      const formattedData: Partial<Member> = {
        ...values,
        id: member?.id,
        MemberDOB: values.MemberDOB ? format(values.MemberDOB, "yyyy-MM-dd") : null,
        // Set MemberStatus field based on Active field
        MemberStatus: values.Active,
      };
      
      const success = await onSubmit(formattedData);
      if (success) {
        form.reset();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="MemberFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MemberLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="MemberEmailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email address"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MemberPhNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MemberAdress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MemberPincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pincode"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MemberDOB"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MemberSex"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberFormDialog;

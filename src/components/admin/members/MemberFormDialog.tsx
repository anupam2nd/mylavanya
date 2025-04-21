
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
import { Button } from "@/components/ui/button";
import { Member } from "@/types/member";
import { MemberFormFields } from "./MemberFormFields";
import { DateOfBirthField } from "./DateOfBirthField";
import { GenderRadioGroupField } from "./GenderRadioGroupField";
import { ActiveStatusCheckboxField } from "./ActiveStatusCheckboxField";
import {
  Form,
} from "@/components/ui/form";

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

  const { control } = form;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <MemberFormFields control={control} />
            <DateOfBirthField control={control} />
            <GenderRadioGroupField control={control} />
            <ActiveStatusCheckboxField control={control} />
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

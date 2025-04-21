
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";

// Form schema
const memberFormSchema = z.object({
  id: z.number().optional(),
  MemberFirstName: z.string().min(1, { message: "First name is required" }),
  MemberLastName: z.string().min(1, { message: "Last name is required" }),
  MemberEmailId: z.string().email({ message: "Invalid email address" }),
  MemberPhNo: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  MemberAdress: z.string().optional(),
  MemberPincode: z.string().optional(),
  MemberDOB: z.date().optional(),
  MemberSex: z.string().optional(),
  Active: z.boolean().default(true),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

interface MemberFormDialogProps {
  memberId?: number;
  onClose: () => void;
  onSave: (member: Member | Partial<Member>) => Promise<boolean>;
  fetchMemberById?: (id: number) => Promise<Member | null>;
  mode: 'create' | 'edit';
}

const MemberFormDialog = ({ 
  memberId, 
  onClose, 
  onSave,
  fetchMemberById,
  mode 
}: MemberFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [fetchingMember, setFetchingMember] = useState(mode === 'edit');
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      MemberFirstName: "",
      MemberLastName: "",
      MemberEmailId: "",
      MemberPhNo: "",
      MemberAdress: "",
      MemberPincode: "",
      MemberSex: "",
      Active: true
    }
  });
  
  // Fetch member data if editing
  useEffect(() => {
    const fetchMember = async () => {
      if (mode === 'edit' && memberId && fetchMemberById) {
        try {
          setFetchingMember(true);
          const member = await fetchMemberById(memberId);
          
          if (member) {
            form.reset({
              id: member.id,
              MemberFirstName: member.MemberFirstName || "",
              MemberLastName: member.MemberLastName || "",
              MemberEmailId: member.MemberEmailId || "",
              MemberPhNo: member.MemberPhNo || "",
              MemberAdress: member.MemberAdress || "",
              MemberPincode: member.MemberPincode || "",
              MemberDOB: member.MemberDOB ? new Date(member.MemberDOB) : undefined,
              MemberSex: member.MemberSex || "",
              Active: member.Active
            });
          }
        } catch (error) {
          console.error("Error fetching member:", error);
        } finally {
          setFetchingMember(false);
        }
      }
    };
    
    fetchMember();
  }, [memberId, fetchMemberById, form, mode]);
  
  const onSubmit = async (values: MemberFormValues) => {
    setLoading(true);
    
    try {
      const success = await onSave(values as Member);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving member:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Member' : 'Edit Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new member to your system.' 
              : 'Update the member\'s information.'}
          </DialogDescription>
        </DialogHeader>
        
        {fetchingMember ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="MemberFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="MemberLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Email */}
                <FormField
                  control={form.control}
                  name="MemberEmailId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="MemberPhNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Address */}
                <FormField
                  control={form.control}
                  name="MemberAdress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Pincode */}
                <FormField
                  control={form.control}
                  name="MemberPincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date of Birth */}
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
                            selected={field.value}
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
                
                {/* Gender */}
                <FormField
                  control={form.control}
                  name="MemberSex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Active status */}
              <FormField
                control={form.control}
                name="Active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Account Active</FormLabel>
                      <FormDescription>
                        Active members can log in and use the system.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Member' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberFormDialog;


import React from "react";
import { format } from "date-fns";
import { Clock, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { editBookingFormSchema, EditBookingFormValues } from "./EditBookingFormSchema";
import { Booking } from "@/hooks/useBookings";

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (booking: Booking, updates: Partial<Booking>) => Promise<void>;
  statusOptions: { status_code: string; status_name: string }[];
  currentUser: { Username?: string } | null;
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  booking,
  open,
  onOpenChange,
  onSave,
  statusOptions,
  currentUser
}) => {
  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingFormSchema),
    defaultValues: {
      date: booking?.Booking_date ? new Date(booking.Booking_date) : undefined,
      time: booking?.booking_time?.substring(0, 5) || "",
      status: booking?.Status || "",
    },
  });

  React.useEffect(() => {
    if (booking) {
      form.reset({
        date: booking.Booking_date ? new Date(booking.Booking_date) : undefined,
        time: booking.booking_time?.substring(0, 5) || "",
        status: booking.Status || "",
      });
    }
  }, [booking, form]);

  const onSubmit = (data: EditBookingFormValues) => {
    if (!booking) return;

    console.log("Submitting form data:", data);
    const updates: Partial<Booking> = {
      Booking_date: data.date ? format(data.date, 'yyyy-MM-dd') : booking.Booking_date,
      booking_time: data.time,
      Status: data.status
    };
    onSave(booking, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Make changes to booking details here.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-10rem)]">
          <div className="px-1">
            {booking && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Date</FormLabel>
                        <div className="col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Time</FormLabel>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Status</FormLabel>
                        <div className="col-span-3">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions && statusOptions.map((option) => (
                                <SelectItem key={option.status_code} value={option.status_code}>
                                  {option.status_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                  
                  {booking && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Customer</FormLabel>
                      <div className="col-span-3">
                        <p className="text-sm font-medium">{booking.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                        <p className="text-sm text-muted-foreground">Phone: {booking.Phone_no}</p>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button onClick={form.handleSubmit(onSubmit)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;

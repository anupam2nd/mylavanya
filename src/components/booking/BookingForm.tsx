
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { bookingFormSchema, type BookingFormProps, type BookingFormValues } from "./form/FormSchema";
import PersonalInfoFields from "./form/PersonalInfoFields";
import DatePickerField from "./form/DatePickerField";
import TimePickerField from "./form/TimePickerField";
import NotesField from "./form/NotesField";
import FormActions from "./form/FormActions";
import { useBookingSubmit } from "./form/useBookingSubmit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const BookingForm = ({ serviceId, serviceName, servicePrice, onCancel, onSuccess }: BookingFormProps) => {
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const { isSubmitting, submitBooking } = useBookingSubmit({
    serviceId,
    serviceName,
    servicePrice,
    onCancel,
    onSuccess
  });

  const onSubmit = async (data: BookingFormValues) => {
    const result = await submitBooking(data);
    if (result.success) {
      setBookingRef(result.bookingRef);
      setBookingCompleted(true);
      form.reset();
    }
  };

  if (bookingCompleted && bookingRef) {
    return (
      <div className="fixed top-10 left-0 right-0 w-full max-w-md mx-auto z-50 bg-white rounded-lg p-6 shadow-lg text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold mb-4">Booking Confirmed!</h3>
        
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Your Booking Reference</h4>
          <p className="text-4xl font-bold text-red-600 mb-2">{bookingRef}</p>
          <p className="text-gray-700">
            Please save this reference number for future inquiries.
          </p>
        </div>
        
        <Button onClick={onCancel} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {servicePrice && (
        <div className="mb-4 text-center">
          <p className="text-lg font-medium">Price: ₹{servicePrice.toFixed(2)}</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PersonalInfoFields />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField />
            <TimePickerField />
          </div>
          
          <NotesField />
          
          <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;

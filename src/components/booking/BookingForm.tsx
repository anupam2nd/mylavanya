
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

const BookingForm = ({ serviceId, serviceName, servicePrice, onCancel, onSuccess }: BookingFormProps) => {
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
    const success = await submitBooking(data);
    if (success) {
      form.reset();
    }
  };

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

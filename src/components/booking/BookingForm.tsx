
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { bookingFormSchema, type BookingFormProps, type BookingFormValues } from "./form/FormSchema";
import PersonalInfoFields from "./form/PersonalInfoFields";
import AddressFields from "./form/AddressFields";
import DatePickerField from "./form/DatePickerField";
import TimePickerField from "./form/TimePickerField";
import NotesField from "./form/NotesField";
import FormActions from "./form/FormActions";
import ServiceSelectionField from "./form/ServiceSelectionField";
import { useBookingSubmit } from "./form/useBookingSubmit";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ serviceId, serviceName, servicePrice, serviceOriginalPrice, onCancel, onSuccess }: BookingFormProps) => {
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is a member
  if (user && user.role !== 'member') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Members Only</h3>
        <p className="text-amber-700 mb-4">Only members can book services. Please login as a member to continue.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Prepare initial selected service if provided as prop
  const initialSelectedService = serviceId && serviceName && servicePrice 
    ? { 
        id: serviceId, 
        name: serviceName, 
        price: servicePrice,
        originalPrice: serviceOriginalPrice || servicePrice
      }
    : undefined;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      pincode: "",
      notes: "",
      selectedDate: undefined,
      selectedTime: "",
      selectedServices: initialSelectedService ? [initialSelectedService] : []
    },
  });

  const { isSubmitting, submitBooking } = useBookingSubmit();

  const onSubmit = async (data: BookingFormValues) => {
    if (!user || user.role !== 'member') {
      // Double check to prevent non-members from submitting
      return;
    }
    
    const result = await submitBooking(data);
    if (result.success) {
      setBookingRef(result.bookingRef);
      setBookingCompleted(true);
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  if (bookingCompleted && bookingRef) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
        <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-2xl text-center animate-fade-in">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold mb-6">Booking Confirmed!</h2>
          
          <div className="mb-4 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Booking Reference</h3>
            <p className="text-5xl font-extrabold text-red-600 mb-4">{bookingRef}</p>
            <p className="text-gray-700">
              Please save this reference number for future inquiries.
            </p>
          </div>
          
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertTitle className="text-lg font-bold">Payment Required</AlertTitle>
            <AlertDescription>
              Your booking is not confirmed until payment is made. Please contact our support team for payment options.
            </AlertDescription>
          </Alert>
          
          <Button onClick={onCancel} className="w-full text-lg py-6" size="lg">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ServiceSelectionField initialSelectedService={initialSelectedService} />

          <PersonalInfoFields />
          <AddressFields />
          
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


import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookingRoleCheck from "./form/BookingRoleCheck";
import BookingCompletedModal from "./form/BookingCompletedModal";
import BookingFormLoader from "./form/BookingFormLoader";

const BookingForm: React.FC<BookingFormProps> = ({ 
  serviceId, 
  serviceName, 
  servicePrice, 
  serviceOriginalPrice, 
  onCancel, 
  onSuccess 
}) => {
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [isLoadingMemberData, setIsLoadingMemberData] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Early role check - if not a member, show member-only message
  if (user && user.role !== 'member') {
    return <BookingRoleCheck user={user} />;
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

  // Load member data when component mounts
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user || user.role !== 'member' || !user.email) return;
      
      try {
        setIsLoadingMemberData(true);
        console.log("Fetching member data for email:", user.email);
        
        const { data, error } = await supabase
          .from('MemberMST')
          .select('*')
          .eq('MemberEmailId', user.email.toLowerCase()) // Ensure lowercase for consistency
          .single();
        
        if (error) {
          console.error('Error fetching member data:', error);
          return;
        }
        
        console.log("Fetched member data:", data);
        
        if (data) {
          // Update form values with member data
          const fullName = `${data.MemberFirstName || ''} ${data.MemberLastName || ''}`.trim();
          form.setValue('name', fullName);
          form.setValue('email', (data.MemberEmailId || user.email).toLowerCase()); // Ensure lowercase
          form.setValue('phone', data.MemberPhNo || '');
          form.setValue('address', data.MemberAdress || '');
          form.setValue('pincode', data.MemberPincode || '');
        }
      } catch (error) {
        console.error('Error in fetching member data:', error);
      } finally {
        setIsLoadingMemberData(false);
      }
    };

    fetchMemberData();
  }, [user, form]);

  const { isSubmitting, submitBooking } = useBookingSubmit();

  const onSubmit = async (data: BookingFormValues) => {
    if (!user || user.role !== 'member') {
      // Double check to prevent non-members from submitting
      return;
    }
    
    console.log("Form submission data:", data);
    
    // Ensure email is lowercase
    data.email = data.email.toLowerCase();
    
    // If user has updated their details, update MemberMST table
    if (user.email) {
      try {
        const nameParts = data.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await supabase
          .from('MemberMST')
          .update({
            MemberFirstName: firstName,
            MemberLastName: lastName,
            MemberPhNo: data.phone,
            MemberAdress: data.address,
            MemberPincode: data.pincode,
            MemberEmailId: data.email.toLowerCase() // Ensure lowercase
          })
          .eq('MemberEmailId', user.email.toLowerCase()); // Match with lowercase
      } catch (error) {
        console.error('Error updating member information:', error);
        // Continue with booking even if update fails
      }
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

  // Show completion modal if booking is successful
  if (bookingCompleted && bookingRef) {
    return <BookingCompletedModal bookingRef={bookingRef} onCancel={onCancel} />;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      {isLoadingMemberData && <BookingFormLoader />}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ServiceSelectionField initialSelectedService={initialSelectedService} />
          
          <div className="space-y-6">
            <PersonalInfoFields />
            <AddressFields />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePickerField />
              <TimePickerField />
            </div>
            
            <NotesField />
          </div>
          
          <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;

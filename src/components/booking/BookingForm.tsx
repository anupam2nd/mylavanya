
import { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BookingFormProps {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  onCancel: () => void;
}

const BookingForm = ({ serviceId, serviceName, servicePrice, onCancel }: BookingFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !name || !phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const bookingDate = date ? format(date, "yyyy-MM-dd") : "";
      
      const { data, error } = await supabase
        .from('BookMST')
        .insert([
          { 
            prodid: serviceId,
            cname: name,
            cemail: email,
            cphone: phone,
            caddress: address,
            cnotes: notes,
            bookingdate: bookingDate,
            bookingtime: time,
            amount: servicePrice
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment for ${serviceName} has been booked.`,
      });
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setDate(undefined);
      setTime("");
      setAddress("");
      setNotes("");
      
      // Close form
      onCancel();
      
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input 
          id="phone" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your contact number"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <ButtonCustom
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Select date</span>}
            </ButtonCustom>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Preferred Time *</Label>
        <Select
          value={time}
          onValueChange={setTime}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Service Location</Label>
        <Textarea 
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Where would you like our service team to come?"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Special Requests</Label>
        <Textarea 
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes for your booking?"
          rows={2}
        />
      </div>
      
      <div className="pt-2 flex gap-3">
        <ButtonCustom
          type="button"
          variant="outline"
          className="w-1/2"
          onClick={onCancel}
        >
          Cancel
        </ButtonCustom>
        <ButtonCustom
          type="submit"
          variant="primary-gradient"
          className="w-1/2"
          isLoading={isSubmitting}
        >
          Confirm Booking
        </ButtonCustom>
      </div>
    </form>
  );
};

export default BookingForm;

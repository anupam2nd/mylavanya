
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
import { Booking } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceOption {
  prod_id: number;
  ProductName: string;
  Services: string;
  Subservice: string;
}

interface NewJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess: (newBooking: Booking) => void;
  currentUser: { Username?: string } | null;
}

const NewJobDialog = ({ open, onOpenChange, booking, onSuccess, currentUser }: NewJobDialogProps) => {
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [subService, setSubService] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [address, setAddress] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  useEffect(() => {
    if (booking) {
      setDate(new Date());
      setTime(new Date().toTimeString().substring(0, 5));
      setAddress(booking.Address || "");
      setPincode(booking.Pincode?.toString() || "");
    }
  }, [booking]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('PriceMST')
          .select('prod_id, ProductName, Services, Subservice')
          .eq('active', true);

        if (error) throw error;
        
        setServiceOptions(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  const filteredSubServices = serviceOptions
    .filter(option => option.Services === service)
    .map(option => option.Subservice)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  const filteredProducts = serviceOptions
    .filter(option => 
      option.Services === service && 
      (subService ? option.Subservice === subService : true)
    )
    .map(option => ({ id: option.prod_id, name: option.ProductName }))
    .filter((value, index, self) => 
      value.name && self.findIndex(item => item.name === value.name) === index
    );

  const uniqueServices = [...new Set(serviceOptions.map(option => option.Services))].filter(Boolean);

  const handleSubmit = async () => {
    if (!booking || !date || !time || !service || !product) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the prod_id for the selected product
      const selectedProduct = serviceOptions.find(
        p => p.ProductName === product && 
            p.Services === service && 
            p.Subservice === subService
      );
      
      if (!selectedProduct) {
        throw new Error("Selected product not found in price list");
      }

      // Get price information
      const { data: priceData, error: priceError } = await supabase
        .from('PriceMST')
        .select('NetPayable, Price')
        .eq('prod_id', selectedProduct.prod_id)
        .eq('active', true)
        .maybeSingle();
        
      if (priceError) throw priceError;
      
      // Calculate price
      const price = priceData?.NetPayable !== undefined && priceData?.NetPayable !== null 
        ? priceData.NetPayable 
        : priceData?.Price;

      // Create new booking record with same booking_no but new job
      const newBookingData = {
        Booking_NO: booking.Booking_NO,
        name: booking.name,
        email: booking.email,
        Phone_no: booking.Phone_no,
        Address: address,
        Pincode: pincode ? Number(pincode) : null,
        Booking_date: format(date, 'yyyy-MM-dd'),
        booking_time: time,
        Purpose: booking.Purpose,
        ServiceName: service,
        SubService: subService,
        ProductName: product,
        prod_id: selectedProduct.prod_id,
        price: price,
        Qty: qty,
        Status: 'pending',
      };

      // Insert the new booking
      const { data: newBooking, error: insertError } = await supabase
        .from('BookMST')
        .insert(newBookingData)
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Job created successfully",
        description: "New job has been added to this booking",
      });

      if (newBooking) {
        onSuccess(newBooking);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating new job:', error);
      toast({
        title: "Failed to create new job",
        description: typeof error === 'object' && error !== null ? (error as Error).message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Job to Booking</DialogTitle>
          <DialogDescription>
            Create a new service job under the same booking number.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="px-1 py-2">
            <div className="grid gap-4">
              {booking && (
                <div className="p-3 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Booking Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Number</p>
                      <p className="text-sm font-medium">{booking.Booking_NO}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="text-sm font-medium">{booking.name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service" className="text-right">
                  Service
                </Label>
                <div className="col-span-3">
                  <Select
                    value={service}
                    onValueChange={(value) => {
                      setService(value);
                      setSubService("");
                      setProduct("");
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueServices.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subservice" className="text-right">
                  Sub Service
                </Label>
                <div className="col-span-3">
                  <Select
                    value={subService}
                    onValueChange={(value) => {
                      setSubService(value);
                      setProduct("");
                    }}
                    disabled={!service}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-service" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubServices.map((subService) => (
                        <SelectItem key={subService} value={subService || ""}>
                          {subService}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Product
                </Label>
                <div className="col-span-3">
                  <Select
                    value={product}
                    onValueChange={setProduct}
                    disabled={!service}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name || ""}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qty" className="text-right">
                  Quantity
                </Label>
                <div className="col-span-3">
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <div className="col-span-3">
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pincode" className="text-right">
                  PIN Code
                </Label>
                <div className="col-span-3">
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
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
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-time" className="text-right">
                  Time
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="booking-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting || !service || !product || !date || !time}
          >
            {isSubmitting ? "Creating..." : "Create New Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobDialog;


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

interface ProductOption {
  prod_id: number;
  ProductName: string;
  Services: string;
  Subservice: string;
  Price: number;
  NetPayable: number | null;
  Scheme: string | null;
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
  const [product, setProduct] = useState<string>("");
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductOption | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [address, setAddress] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  useEffect(() => {
    if (booking) {
      setDate(new Date());
      setTime(new Date().toTimeString().substring(0, 5));
      setAddress(booking.Address || "");
      setPincode(booking.Pincode?.toString() || "");
    }
  }, [booking]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('PriceMST')
          .select('prod_id, ProductName, Services, Subservice, Price, NetPayable, Scheme')
          .eq('active', true)
          .order('ProductName');

        if (error) throw error;
        
        setProductOptions(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Update selectedProductDetails when product changes
  useEffect(() => {
    if (product) {
      const productDetail = productOptions.find(p => p.ProductName === product);
      if (productDetail) {
        setSelectedProductDetails(productDetail);
        console.log("Selected product details:", productDetail);
      }
    } else {
      setSelectedProductDetails(null);
    }
  }, [product, productOptions]);

  const handleSubmit = async () => {
    if (!booking || !date || !time || !product || !selectedProductDetails) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate price
      const price = selectedProductDetails.NetPayable !== undefined && selectedProductDetails.NetPayable !== null 
        ? selectedProductDetails.NetPayable 
        : selectedProductDetails.Price;

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
        ServiceName: selectedProductDetails.Services,
        SubService: selectedProductDetails.Subservice,
        ProductName: product,
        prod_id: selectedProductDetails.prod_id,
        Scheme: selectedProductDetails.Scheme,
        price: price,
        Qty: qty,
        Status: 'pending',
      };

      console.log("Creating new job with data:", newBookingData);

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
                <Label htmlFor="product" className="text-right">
                  Product
                </Label>
                <div className="col-span-3">
                  <Select
                    value={product}
                    onValueChange={setProduct}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {productOptions.map((product) => (
                        <SelectItem key={product.prod_id} value={product.ProductName}>
                          {product.ProductName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedProductDetails && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Service Details</Label>
                  <div className="col-span-3 p-3 border rounded-md bg-muted/20">
                    <p><span className="font-medium">Service:</span> {selectedProductDetails.Services}</p>
                    <p><span className="font-medium">Sub Service:</span> {selectedProductDetails.Subservice || "N/A"}</p>
                    {selectedProductDetails.Scheme && (
                      <p><span className="font-medium">Scheme:</span> {selectedProductDetails.Scheme}</p>
                    )}
                    <p className="font-medium mt-1">
                      Price: ₹{(selectedProductDetails.NetPayable !== null ? 
                        selectedProductDetails.NetPayable : 
                        selectedProductDetails.Price).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              
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
            disabled={isSubmitting || !product || !date || !time}
          >
            {isSubmitting ? "Creating..." : "Create New Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobDialog;

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
  DialogTrigger,
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
import TimeSlotPicker from "./TimeSlotPicker";

interface ProductOption {
  prod_id: number;
  ProductName: string;
  Services: string;
  Subservice: string;
  Price: number;
  NetPayable: number | null;
  Scheme: string | null;
}

interface ArtistOption {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
}

interface CurrentUser {
  Username?: string;
  FirstName?: string;
  LastName?: string;
}

interface NewJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess: (newBooking: Booking) => void;
  currentUser: CurrentUser | null;
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
  const [status, setStatus] = useState<string>("pending");
  const [artistId, setArtistId] = useState<number | null>(null);
  
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<{status_code: string, status_name: string}[]>([]);

  useEffect(() => {
    if (booking) {
      setDate(new Date());
      // Set a default time like "09:00" (9 AM)
      setTime("09:00");
      setAddress(booking.Address || "");
      setPincode(booking.Pincode?.toString() || "");
    }
  }, [booking]);

  // Fetch products
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

  // Fetch artists
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName')
          .eq('Active', true);

        if (error) throw error;
        
        setArtistOptions(data || []);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchArtists();
  }, []);

  // Fetch status options
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name')
          .eq('active', true)
          .order('id');

        if (error) throw error;
        
        setStatusOptions(data || []);
      } catch (error) {
        console.error('Error fetching status options:', error);
      }
    };

    fetchStatusOptions();
  }, []);

  // Update selectedProductDetails when product changes
  useEffect(() => {
    if (product) {
      const productDetail = productOptions.find(p => p.ProductName === product);
      if (productDetail) {
        setSelectedProductDetails(productDetail);
      }
    } else {
      setSelectedProductDetails(null);
    }
  }, [product, productOptions]);

  // Check if status requires artist assignment
  const requiresArtist = (statusValue: string): boolean => {
    const artistRequiredStatuses = ['beautician_assigned', 'on_the_way', 'service_started', 'done'];
    return artistRequiredStatuses.includes(statusValue);
  };

  // Get the status name for a given status code
  const getStatusName = (statusCode: string): string => {
    const statusOption = statusOptions.find(option => option.status_code === statusCode);
    return statusOption ? statusOption.status_name : "Pending";
  };

  const getArtistName = (id: number): string => {
    const artist = artistOptions.find(a => a.ArtistId === id);
    if (!artist) return `Artist ${id}`;
    
    const firstName = artist.ArtistFirstName || '';
    const lastName = artist.ArtistLastName || '';
    
    return `${firstName} ${lastName}`.trim();
  };

  const handleSubmit = async () => {
    if (!booking || !date || !time || !product || !selectedProductDetails) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if artist is required but not selected
    if (requiresArtist(status) && !artistId) {
      toast({
        title: "Artist required",
        description: "Please select an artist for this status",
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

      // Find the highest job number for this booking
      const { data: existingJobs, error: queryError } = await supabase
        .from('BookMST')
        .select('jobno')
        .eq('Booking_NO', parseInt(booking.Booking_NO)) // Convert string to number for database query
        .order('jobno', { ascending: false })
        .limit(1);

      if (queryError) {
        console.error('Error fetching existing jobs:', queryError);
        throw queryError;
      }
      
      // Calculate the next job number
      const highestJobNo = existingJobs && existingJobs.length > 0 && existingJobs[0].jobno !== null 
        ? Number(existingJobs[0].jobno) 
        : 0;
        
      const nextJobNo = highestJobNo + 1;
      console.log("Creating new job with job number:", nextJobNo);

      // Create new booking record with same booking_no but new job
      const bookingNoAsNumber = parseInt(booking.Booking_NO);
      const currentTime = new Date();
      
      const newBookingData: any = {
        Booking_NO: bookingNoAsNumber, // Store as number in database
        name: booking.name,
        Phone_no: booking.Phone_no,
        Address: address,
        Pincode: pincode ? Number(pincode) : null,
        Booking_date: format(date, 'yyyy-MM-dd'),
        booking_time: time,
        Purpose: booking.Purpose,
        ServiceName: selectedProductDetails.Services,
        SubService: selectedProductDetails.Subservice,
        ProductName: product,
        Product: selectedProductDetails.prod_id, // Use Product field for database compatibility
        Scheme: selectedProductDetails.Scheme,
        price: price,
        Qty: qty,
        Status: getStatusName(status), // Use the status name instead of code for readability
        StatusUpdated: currentTime.toISOString(),
        created_at: currentTime,
        jobno: nextJobNo,
      };

      // Only add email if it exists in the booking
      if (booking.email) {
        newBookingData.email = booking.email;
      }

      // Add artist assignment fields if required
      if (requiresArtist(status) && artistId) {
        // Fetch artist details to get employee code
        const { data: artistDetails } = await supabase
          .from('ArtistMST')
          .select('ArtistEmpCode')
          .eq('ArtistId', artistId)
          .single();

        newBookingData.ArtistId = artistId;
        newBookingData.Assignedto = getArtistName(artistId);
        
        if (artistDetails && artistDetails.ArtistEmpCode) {
          newBookingData.AssignedToEmpCode = artistDetails.ArtistEmpCode;
        }
        
        // Set AssignedBY to current user's full name instead of just username
        if (currentUser) {
          const firstName = currentUser.FirstName || '';
          const lastName = currentUser.LastName || '';
          
          if (firstName || lastName) {
            newBookingData.AssignedBY = `${firstName} ${lastName}`.trim();
          } else {
            // Fallback to username if no name is available
            newBookingData.AssignedBY = currentUser.Username || 'admin';
          }
          
          // Set AssignedByUser to username
          if (currentUser.Username) {
            newBookingData.AssignedByUser = currentUser.Username;
          }
        } else {
          newBookingData.AssignedBY = 'admin';
        }
        
        newBookingData.AssingnedON = currentTime.toISOString();
      }

      console.log("Creating new job with data:", newBookingData);

      // Insert the new booking
      const { data: newBooking, error: insertError } = await supabase
        .from('BookMST')
        .insert(newBookingData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Job created successfully",
        description: "New job has been added to this booking",
      });

      if (newBooking) {
        // Transform the data to ensure Booking_NO is a string
        const transformedBooking: Booking = {
          ...newBooking,
          Booking_NO: String(newBooking.Booking_NO)
        };
        onSuccess(transformedBooking);
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
                        className={cn("p-3 pointer-events-auto")}
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
                  <TimeSlotPicker
                    value={time}
                    onChange={setTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select
                    value={status}
                    onValueChange={setStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.status_code} value={option.status_code}>
                          {option.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {requiresArtist(status) && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="artist" className="text-right">
                    Assigned Artist
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={artistId ? String(artistId) : ""}
                      onValueChange={(value) => setArtistId(parseInt(value, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {artistOptions.map((artist) => (
                          <SelectItem key={artist.ArtistId} value={String(artist.ArtistId)}>
                            {`${artist.ArtistFirstName || ""} ${artist.ArtistLastName || ""}`.trim() || `Artist ${artist.ArtistId}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Artist assignment is required for this status
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting || !product || !date || !time || (requiresArtist(status) && !artistId)}
          >
            {isSubmitting ? "Creating..." : "Create New Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobDialog;

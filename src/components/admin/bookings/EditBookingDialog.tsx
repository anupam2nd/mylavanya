
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TotalAmount from "@/components/tracking/TotalAmount";
import { cn } from "@/lib/utils";
import { editBookingFormSchema, EditBookingFormValues } from "./EditBookingFormSchema";
import { Booking } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";

interface EditBookingDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  editBooking: Booking | null;
  handleSaveChanges: (values: EditBookingFormValues) => void;
  statusOptions: { status_code: string; status_name: string }[];
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  openDialog,
  setOpenDialog,
  editBooking,
  handleSaveChanges,
  statusOptions,
}) => {
  const [artists, setArtists] = useState<{ ArtistId: number; displayName: string }[]>([]);
  const [requiresArtist, setRequiresArtist] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  
  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingFormSchema),
    defaultValues: {
      date: editBooking?.Booking_date ? new Date(editBooking.Booking_date) : undefined,
      time: editBooking?.booking_time?.substring(0, 5) || "",
      status: editBooking?.Status || "",
      address: editBooking?.Address || "",
      pincode: editBooking?.Pincode?.toString() || "",
      quantity: editBooking?.Qty || 1,
      artistId: editBooking?.ArtistId || null,
    },
  });

  const watchStatus = form.watch("status");
  const watchQuantity = form.watch("quantity", 1);

  // Fetch price data when booking changes
  useEffect(() => {
    const fetchPriceData = async () => {
      if (!editBooking || !editBooking.prod_id) return;
      
      setLoading(true);
      try {
        console.log("Fetching price data for product:", editBooking.prod_id);
        
        const { data, error } = await supabase
          .from('PriceMST')
          .select('NetPayable')
          .eq('prod_id', editBooking.prod_id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching price:', error);
          return;
        }
        
        if (data && data.NetPayable !== null) {
          console.log("Price data from PriceMST:", data);
          const netPayable = parseFloat(data.NetPayable);
          setUnitPrice(netPayable);
          
          // Fix for TypeScript error - ensure quantity is treated as a number
          const qty = watchQuantity;
          const total = netPayable * (typeof qty === 'string' ? parseInt(qty, 10) : qty);
          setCalculatedPrice(total);
          
          console.log("Price calculation:", {
            unitPrice: netPayable,
            quantity: qty,
            totalPrice: total
          });
        } else {
          console.log("No price data found or NetPayable is null");
          setCalculatedPrice(0);
          setUnitPrice(0);
        }
      } catch (err) {
        console.error("Error calculating price:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceData();
  }, [editBooking, watchQuantity]);

  // Recalculate price when quantity changes
  useEffect(() => {
    if (unitPrice !== null) {
      const qty = watchQuantity < 1 ? 1 : watchQuantity;
      // Fix for TypeScript error - ensure quantity is treated as a number
      const total = unitPrice * (typeof qty === 'string' ? parseInt(qty, 10) : qty);
      setCalculatedPrice(total);
      console.log("Recalculating price due to quantity change:", {
        unitPrice,
        quantity: qty,
        newTotal: total
      });
    }
  }, [watchQuantity, unitPrice]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName')
          .eq('Active', true);
          
        if (error) throw error;
        
        const formattedArtists = data.map(artist => ({
          ArtistId: artist.ArtistId,
          displayName: `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || `Artist ${artist.ArtistId}`
        }));
        
        setArtists(formattedArtists);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    
    fetchArtists();
  }, []);

  // Check if artist assignment is required based on status
  useEffect(() => {
    const statuses = ['beautician_assigned', 'on_the_way', 'service_started', 'done', 'OnTheway', 'Start'];
    setRequiresArtist(statuses.includes(watchStatus));
  }, [watchStatus]);

  // Reset form when booking changes
  useEffect(() => {
    if (editBooking) {
      form.reset({
        date: editBooking.Booking_date ? new Date(editBooking.Booking_date) : undefined,
        time: editBooking.booking_time?.substring(0, 5) || "",
        status: editBooking.Status || "",
        address: editBooking?.Address || "",
        pincode: editBooking?.Pincode?.toString() || "",
        quantity: editBooking?.Qty || 1,
        artistId: editBooking?.ArtistId || null,
      });
    }
  }, [editBooking, form]);

  const onSubmit = (data: EditBookingFormValues) => {
    console.log("Submitting form data:", data);
    
    // Check if artist is required but not selected
    if (requiresArtist && !data.artistId) {
      form.setError("artistId", { 
        type: "manual", 
        message: "Artist selection is required for this status" 
      });
      return;
    }
    
    // Add calculated price to the data
    const dataWithPrice = {
      ...data,
      calculatedPrice: calculatedPrice || 0
    };
    
    handleSaveChanges(dataWithPrice);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Make changes to booking details here.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-10rem)]">
          <div className="px-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {editBooking && (editBooking.ServiceName || editBooking.ProductName) && (
                  <div className="border p-3 rounded-md bg-muted/20 space-y-1">
                    <h3 className="text-sm font-medium mb-1">Service Details</h3>
                    {editBooking.ServiceName && (
                      <p className="text-sm">
                        <span className="font-medium">Service:</span> {editBooking.ServiceName}
                      </p>
                    )}
                    {editBooking.SubService && (
                      <p className="text-sm">
                        <span className="font-medium">Sub Service:</span> {editBooking.SubService}
                      </p>
                    )}
                    {editBooking.ProductName && (
                      <p className="text-sm">
                        <span className="font-medium">Product:</span> {editBooking.ProductName}
                      </p>
                    )}
                    {editBooking.Scheme && (
                      <p className="text-sm">
                        <span className="font-medium">Scheme:</span> {editBooking.Scheme}
                      </p>
                    )}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                field.onChange(isNaN(value) ? 1 : Math.max(1, value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-3">
                      <TotalAmount 
                        amount={calculatedPrice || 0} 
                        loading={loading}
                        className=""
                      />
                      
                      {unitPrice !== null && !loading && (
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          <p>Unit price: ₹{unitPrice.toFixed(2)} × {watchQuantity} = ₹{calculatedPrice?.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
                
                {requiresArtist && (
                  <FormField
                    control={form.control}
                    name="artistId"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Assign Artist</FormLabel>
                        <div className="col-span-3">
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an artist" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {artists.map((artist) => (
                                <SelectItem key={artist.ArtistId} value={artist.ArtistId.toString()}>
                                  {artist.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {requiresArtist && !field.value && (
                            <p className="text-xs text-red-500 mt-1">
                              Artist assignment is required for this status
                            </p>
                          )}
                        </div>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Address</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <textarea
                            className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="col-span-4 text-right" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Pincode</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            maxLength={6}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="col-span-4 text-right" />
                    </FormItem>
                  )}
                />
                
                {editBooking && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Customer</FormLabel>
                    <div className="col-span-3">
                      <p className="text-sm font-medium">{editBooking.name}</p>
                      <p className="text-sm text-muted-foreground">{editBooking.email}</p>
                      <p className="text-sm text-muted-foreground">Phone: {editBooking.Phone_no}</p>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={requiresArtist && !form.getValues().artistId}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;

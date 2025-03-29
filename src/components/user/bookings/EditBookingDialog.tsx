import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, MapPin, Phone, Package } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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

interface ArtistOption {
  ArtistId: number;
  displayName: string;
}

interface ServiceOption {
  prod_id: number;
  ProductName: string;
  Services: string;
  Subservice: string;
}

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (booking: Booking, updates: Partial<Booking>) => Promise<void>;
  statusOptions: { status_code: string; status_name: string }[];
  currentUser: { Username?: string } | null;
}

const EditBookingDialog = ({ 
  booking, 
  open, 
  onOpenChange, 
  onSave, 
  statusOptions,
  currentUser
}: EditBookingDialogProps) => {
  // Form state variables
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");
  const [editPincode, setEditPincode] = useState<string>("");
  const [editArtist, setEditArtist] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [editService, setEditService] = useState<string>("");
  const [editSubService, setEditSubService] = useState<string>("");
  const [editProductName, setEditProductName] = useState<string>("");
  
  // Options for dropdowns
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  // Fetch artists from database
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName')
          .eq('Active', true);

        if (error) throw error;
        
        const options = data.map(artist => ({
          ArtistId: artist.ArtistId,
          displayName: `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim()
        }));
        
        setArtistOptions(options);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

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

    fetchArtists();
    fetchServices();
  }, []);

  // Update form values when booking changes
  useEffect(() => {
    if (booking) {
      setEditDate(booking.Booking_date ? new Date(booking.Booking_date) : undefined);
      setEditTime(booking.booking_time?.substring(0, 5) || "");
      setEditStatus(booking.Status || "");
      setEditAddress(booking.Address || "");
      setEditPincode(booking.Pincode?.toString() || "");
      setEditArtist(booking.ArtistId || null);
      setEditQty(booking.Qty || 1);
      setEditService(booking.ServiceName || "");
      setEditSubService(booking.SubService || "");
      setEditProductName(booking.ProductName || "");
    }
  }, [booking]);

  // Filter options for subservices based on selected service
  const filteredSubServices = serviceOptions
    .filter(option => option.Services === editService)
    .map(option => option.Subservice)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  // Filter options for products based on selected service and subservice
  const filteredProducts = serviceOptions
    .filter(option => 
      option.Services === editService && 
      (editSubService ? option.Subservice === editSubService : true)
    )
    .map(option => ({ id: option.prod_id, name: option.ProductName }))
    .filter((value, index, self) => 
      value.name && self.findIndex(item => item.name === value.name) === index
    );

  // Get unique service names for the dropdown
  const uniqueServices = [...new Set(serviceOptions.map(option => option.Services))].filter(Boolean);

  // Check if status requires artist assignment
  const requiresArtist = (status: string) => {
    const assignmentStatuses = ['beautician_assigned', 'on_the_way', 'service_started', 'done'];
    return assignmentStatuses.includes(status);
  };

  const handleSaveChanges = async () => {
    if (!booking) return;

    // Build updates object with only changed fields
    const updates: Partial<Booking> = {};
    
    if (editDate) {
      updates.Booking_date = format(editDate, 'yyyy-MM-dd');
    }
    
    if (editTime) {
      updates.booking_time = editTime;
    }
    
    if (editStatus && editStatus !== booking.Status) {
      updates.Status = editStatus;
      updates.StatusUpdated = new Date().toISOString();
    }
    
    if (editAddress !== booking.Address) {
      updates.Address = editAddress;
    }
    
    if (editPincode !== (booking.Pincode?.toString() || "")) {
      updates.Pincode = editPincode ? parseInt(editPincode, 10) : null;
    }
    
    if (editQty !== booking.Qty && editQty > 0) {
      updates.Qty = editQty;
    }
    
    // Add service, subservice and product updates
    if (editService !== booking.ServiceName) {
      updates.ServiceName = editService;
    }
    
    if (editSubService !== booking.SubService) {
      updates.SubService = editSubService;
    }
    
    if (editProductName !== booking.ProductName) {
      updates.ProductName = editProductName;
      
      // Find and update the product ID if the product name changes
      const selectedProduct = serviceOptions.find(
        p => p.ProductName === editProductName && 
             p.Services === editService && 
             p.Subservice === editSubService
      );
      
      if (selectedProduct) {
        updates.Product = selectedProduct.prod_id;
      }
    }
    
    // Handle artist assignment based on status
    if (requiresArtist(editStatus)) {
      if (editArtist) {
        updates.ArtistId = editArtist;
        
        // Get artist name from options
        const selectedArtist = artistOptions.find(a => a.ArtistId === editArtist);
        if (selectedArtist) {
          updates.Assignedto = selectedArtist.displayName;
        }
        
        // Set assigned by and timestamp
        updates.AssignedBY = currentUser?.Username || 'admin';
        updates.AssingnedON = new Date().toISOString();
      }
    }

    await onSave(booking, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Service Booking</DialogTitle>
          <DialogDescription>
            Make changes to the service booking details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {booking && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="job-no" className="text-right">
                  Job Number
                </Label>
                <div className="col-span-3">
                  <Input
                    id="job-no"
                    value={booking.jobno ? `JOB-${booking.jobno.toString().padStart(3, '0')}` : 'N/A'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              
              {/* Service Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service" className="text-right">
                  Service
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editService}
                    onValueChange={setEditService}
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
              
              {/* Sub-service Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subservice" className="text-right">
                  Sub Service
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editSubService}
                    onValueChange={setEditSubService}
                    disabled={!editService}
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
              
              {/* Product Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Product
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editProductName}
                    onValueChange={setEditProductName}
                    disabled={!editService}
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
                    value={editQty}
                    onChange={(e) => setEditQty(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="address"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="resize-none"
                    rows={2}
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
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.replace(/[^0-9]/g, ''))}
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
                          !editDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editDate}
                        onSelect={setEditDate}
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
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking-status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editStatus}
                    onValueChange={setEditStatus}
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assigned-artist" className="text-right">
                  Assigned Artist
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editArtist?.toString() || ""}
                    onValueChange={(value) => setEditArtist(value ? parseInt(value, 10) : null)}
                    disabled={!requiresArtist(editStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artistOptions.map((artist) => (
                        <SelectItem key={artist.ArtistId} value={artist.ArtistId.toString()}>
                          {artist.displayName || `Artist ${artist.ArtistId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(requiresArtist(editStatus) && !editArtist) && (
                    <p className="text-xs text-destructive mt-1">
                      Artist assignment is required for this status
                    </p>
                  )}
                  
                  {!requiresArtist(editStatus) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Artist assignment available when status is "Beautician Assigned" or later
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSaveChanges}
            disabled={requiresArtist(editStatus) && !editArtist}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;

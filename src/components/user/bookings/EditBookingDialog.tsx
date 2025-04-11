import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, MapPin, Phone, Package, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  onSave?: (booking: Booking, updates: Partial<Booking>) => Promise<void>;
  statusOptions?: { status_code: string; status_name: string }[];
  currentUser?: { Username?: string } | null;
}

const EditBookingDialog = ({ 
  booking, 
  open, 
  onOpenChange, 
  onSave, 
  statusOptions = [],
  currentUser = null
}: EditBookingDialogProps) => {
  const { toast } = useToast();
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");
  const [editPincode, setEditPincode] = useState<string>("");
  const [editArtist, setEditArtist] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [showNewJobDialog, setShowNewJobDialog] = useState<boolean>(false);
  
  // These fields are now read-only
  const [editService, setEditService] = useState<string>("");
  const [editSubService, setEditSubService] = useState<string>("");
  const [editProductName, setEditProductName] = useState<string>("");

  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

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

    fetchArtists();
  }, []);

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

  const requiresArtist = (status: string) => {
    const assignmentStatuses = ['beautician_assigned', 'on_the_way', 'service_started', 'done'];
    return assignmentStatuses.includes(status);
  };

  const handleSaveChanges = async () => {
    if (!booking || !onSave) return;

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
    
    if (editArtist !== booking.ArtistId) {
      updates.ArtistId = editArtist;
      
      const selectedArtist = artistOptions.find(a => a.ArtistId === editArtist);
      if (selectedArtist) {
        updates.Assignedto = selectedArtist.displayName || 'Assigned Artist';
      }
      
      updates.AssignedBY = currentUser?.Username || 'admin';
      updates.AssingnedON = new Date().toISOString();
    }

    console.log("Saving booking updates:", updates);
    
    await onSave(booking, updates);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleAddNewJob = () => {
    setShowNewJobDialog(true);
    console.log("Add new job clicked");
    toast({
      title: "Feature Not Implemented",
      description: "Adding new jobs functionality is not implemented yet.",
    });
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Edit Service Booking</DialogTitle>
        <DialogDescription>
          Make changes to the service booking details.
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[calc(90vh-8rem)]">
        <div className="px-1 py-2">
          {booking && (
            <div className="grid gap-4">
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
              
              {/* Read-only service fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-info" className="text-right">
                  Service Information
                </Label>
                <div className="col-span-3">
                  <div className="p-3 border rounded-md bg-muted">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Service</span>
                        <span className="font-medium">{editService || 'N/A'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Sub Service</span>
                        <span className="font-medium">{editSubService || 'N/A'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Product</span>
                        <span className="font-medium">{editProductName || 'N/A'}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Quantity</span>
                        <Input
                          id="qty"
                          type="number"
                          min="1"
                          value={editQty}
                          onChange={(e) => setEditQty(parseInt(e.target.value, 10) || 1)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Button 
                        onClick={handleAddNewJob}
                        className="w-full"
                        type="button"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add New Job
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add a new job to this booking with a different service
                      </p>
                    </div>
                  </div>
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
                        <SelectItem key={option.status_code} value={option.status_code || 'pending'}>
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select artist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {artistOptions.map((artist) => (
                        <SelectItem key={artist.ArtistId} value={artist.ArtistId.toString()}>
                          {artist.displayName || `Artist ${artist.ArtistId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          onClick={handleSaveChanges}
          disabled={!onSave}
        >
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditBookingDialog;


import React from "react";
import { format } from "date-fns";
import { Clock, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";

interface Booking {
  id: number;
  Booking_NO: string;
  name: string;
  email: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  Status: string;
  price: number;
  Address?: string;
  Pincode?: number;
}

interface EditBookingDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  editBooking: Booking | null;
  editDate: Date | undefined;
  setEditDate: (date: Date | undefined) => void;
  editTime: string;
  setEditTime: (time: string) => void;
  editStatus: string;
  setEditStatus: (status: string) => void;
  handleSaveChanges: () => void;
  statusOptions: { status_code: string; status_name: string }[];
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  openDialog,
  setOpenDialog,
  editBooking,
  editDate,
  setEditDate,
  editTime,
  setEditTime,
  editStatus,
  setEditStatus,
  handleSaveChanges,
  statusOptions,
}) => {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Make changes to booking details here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="booking-status" className="text-right">
              Status
            </Label>
            <Select
              value={editStatus}
              onValueChange={setEditStatus}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions && statusOptions.map((option) => (
                  <SelectItem key={option.status_code} value={option.status_code}>
                    {option.status_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {editBooking && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Customer</Label>
              <div className="col-span-3">
                <p className="text-sm font-medium">{editBooking.name}</p>
                <p className="text-sm text-muted-foreground">{editBooking.email}</p>
                <p className="text-sm text-muted-foreground">Phone: {editBooking.Phone_no}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSaveChanges}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;

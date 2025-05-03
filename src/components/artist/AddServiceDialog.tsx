
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ServiceSelectionStep from "./ServiceSelectionStep";
import OtpVerificationStep from "./OtpVerificationStep";
import ProcessingIndicator from "./ProcessingIndicator";
import { useServiceAddition } from "@/hooks/useServiceAddition";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  bookingNo: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  onServiceAdded: () => void;
}

const AddServiceDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingNo,
  customerPhone,
  customerName,
  customerEmail,
  onServiceAdded
}: AddServiceDialogProps) => {
  const {
    step,
    services,
    isLoading,
    selectedService,
    setStep,
    fetchServices,
    fetchBookingDetails,
    handleServiceSelection,
    verifyOTP,
    resetDialog
  } = useServiceAddition({
    bookingId,
    bookingNo,
    customerName,
    customerPhone,
    customerEmail,
    onServiceAdded,
    onClose: () => onOpenChange(false)
  });

  // Fetch services and booking details when dialog is opened
  useEffect(() => {
    if (open) {
      fetchServices();
      fetchBookingDetails();
    } else {
      resetDialog();
    }
  }, [open]);

  const getDialogTitle = () => {
    switch (step) {
      case "service":
        return "Add New Service";
      case "otp":
        return "Verify Customer OTP";
      case "processing":
        return "Processing...";
      default:
        return "Add Service";
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case "service":
        return `Adding a new service to booking #${bookingNo} for ${customerName}`;
      case "otp":
        return "Please ask the customer to enter the OTP sent to their phone";
      case "processing":
        return "Please wait while we process your request...";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        {step === "service" && (
          <ServiceSelectionStep
            services={services}
            isLoading={isLoading}
            onSelect={handleServiceSelection}
            onCancel={() => onOpenChange(false)}
          />
        )}
        
        {step === "otp" && (
          <OtpVerificationStep
            isLoading={isLoading}
            serviceDetails={selectedService}
            onVerify={verifyOTP}
            onBack={() => setStep("service")}
          />
        )}
        
        {step === "processing" && <ProcessingIndicator />}
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;

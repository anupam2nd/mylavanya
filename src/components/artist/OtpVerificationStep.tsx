
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Define form schema
const otpFormSchema = z.object({
  otp: z.string().length(4, "OTP must be exactly 4 digits"),
});

type OTPFormValues = z.infer<typeof otpFormSchema>;

interface OtpVerificationStepProps {
  isLoading: boolean;
  serviceDetails: any;
  onVerify: (otp: string) => Promise<void>;
  onBack: () => void;
}

const OtpVerificationStep = ({
  isLoading,
  serviceDetails,
  onVerify,
  onBack,
}: OtpVerificationStepProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OTPFormValues) => {
    await onVerify(data.otp);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="otp">Enter 4-digit OTP</Label>
          <div className="flex justify-center">
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <InputOTP maxLength={4} {...field}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </div>
          {errors.otp && (
            <p className="text-sm text-center text-destructive">{errors.otp.message}</p>
          )}
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Adding: {serviceDetails?.ProductName} - ₹{serviceDetails?.Price || 0}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Add Service"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default OtpVerificationStep;

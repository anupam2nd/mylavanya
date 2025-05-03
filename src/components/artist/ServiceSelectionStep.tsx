
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

// Define form schema
const serviceFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceSelectionStepProps {
  services: any[];
  isLoading: boolean;
  onSelect: (serviceId: string) => Promise<void>;
  onCancel: () => void;
}

const ServiceSelectionStep = ({
  services,
  isLoading,
  onSelect,
  onCancel,
}: ServiceSelectionStepProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceId: "",
    },
  });

  const onSubmit = async (data: ServiceFormValues) => {
    await onSelect(data.serviceId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="service">Select Service</Label>
          <Controller
            name="serviceId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem
                      key={service.prod_id}
                      value={service.prod_id.toString()}
                    >
                      {service.ProductName} - ₹{service.Price || 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.serviceId && (
            <p className="text-sm text-destructive">{errors.serviceId.message}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ServiceSelectionStep;

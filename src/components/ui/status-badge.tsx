
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  description?: string;
  showTooltip?: boolean;
  children?: React.ReactNode;
}

export const StatusBadge = ({ status, className, description, showTooltip = false, children }: StatusBadgeProps) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: {
      label: "Pending",
      variant: "outline",
    },
    approve: {
      label: "Approved",
      variant: "secondary",
    },
    process: {
      label: "In Process",
      variant: "default",
    },
    service_started: {
      label: "Service Started",
      variant: "default",
    },
    ontheway: {
      label: "On the Way",
      variant: "default",
    },
    done: {
      label: "Completed",
      variant: "default",
    },
    cancel: {
      label: "Cancelled",
      variant: "destructive",
    },
  };

  const statusInfo = statusMap[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    variant: "outline",
  };

  const badge = (
    <Badge 
      variant={statusInfo.variant}
      className={cn(
        status === "done" && "bg-green-600",
        status === "process" && "bg-blue-600",
        status === "ontheway" && "bg-amber-600",
        status === "service_started" && "bg-indigo-600",
        className
      )}
    >
      {children || statusInfo.label}
    </Badge>
  );

  if (showTooltip && description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

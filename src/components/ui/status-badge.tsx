
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StatusType = "completed" | "pending" | "cancelled" | "processing" | string;

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusType;
  description?: string;
  showTooltip?: boolean;
  classNames?: {
    root?: string;
    text?: string;
  };
}

// Map status codes to style configurations
const getStatusStyles = (status: StatusType) => {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes("complete") || normalizedStatus.includes("completed") || normalizedStatus.includes("done")) {
    return {
      bg: "bg-green-100",
      text: "text-green-800",
    };
  } else if (normalizedStatus.includes("pending")) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    };
  } else if (
    normalizedStatus.includes("processing") || 
    normalizedStatus.includes("assigned") || 
    normalizedStatus.includes("beautician") || 
    normalizedStatus.includes("beautician_assigned")
  ) {
    return {
      bg: "bg-blue-100",
      text: "text-blue-800",
    };
  } else if (normalizedStatus.includes("cancelled")) {
    return {
      bg: "bg-red-100",
      text: "text-red-800",
    };
  } else if (normalizedStatus.includes("on_the_way") || normalizedStatus.includes("on the way") || normalizedStatus.includes("ontheway")) {
    return {
      bg: "bg-amber-100",
      text: "text-amber-800",
    };
  } else if (
    normalizedStatus.includes("start") || 
    normalizedStatus.includes("service_started") ||
    normalizedStatus.includes("service started")
  ) {
    return {
      bg: "bg-indigo-100", 
      text: "text-indigo-800",
    };
  } else {
    return {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };
  }
};

export const StatusBadge = ({ 
  status, 
  description, 
  showTooltip = false, 
  classNames, 
  className, 
  ...props 
}: StatusBadgeProps) => {
  const [displayStatus, setDisplayStatus] = useState<string>(status);
  const styles = getStatusStyles(status);

  // Fetch appropriate status name for display
  useEffect(() => {
    const fetchStatusName = async () => {
      try {
        // First check if status is a status_code
        const { data: codeData, error: codeError } = await supabase
          .from('statusmst')
          .select('status_name')
          .eq('status_code', status)
          .single();
        
        if (!codeError && codeData) {
          setDisplayStatus(codeData.status_name);
          return;
        }
        
        // Then check if status matches a status_name
        const { data: nameData, error: nameError } = await supabase
          .from('statusmst')
          .select('status_name')
          .eq('status_name', status)
          .single();
        
        if (!nameError && nameData) {
          setDisplayStatus(nameData.status_name);
          return;
        }
        
        // Try a case-insensitive match on status_name
        const { data: nameDataCaseInsensitive } = await supabase
          .from('statusmst')
          .select('status_name')
          .ilike('status_name', status);
          
        if (nameDataCaseInsensitive && nameDataCaseInsensitive.length > 0) {
          setDisplayStatus(nameDataCaseInsensitive[0].status_name);
          return;
        }
        
        // Try a case-insensitive match on status_code
        const { data: codeDataCaseInsensitive } = await supabase
          .from('statusmst')
          .select('status_name')
          .ilike('status_code', status);
          
        if (codeDataCaseInsensitive && codeDataCaseInsensitive.length > 0) {
          setDisplayStatus(codeDataCaseInsensitive[0].status_name);
          return;
        }
        
        // Fallback to formatted display of the original status
        const formatted = status
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setDisplayStatus(formatted);
        
      } catch (error) {
        console.error('Error fetching status name:', error);
        // Format the status as a fallback
        const formatted = status
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setDisplayStatus(formatted);
      }
    };
    
    fetchStatusName();
  }, [status]);
  
  const badge = (
    <Badge
      {...props}
      className={cn(
        "px-2 py-0.5 rounded-full font-medium border-0 text-xs",
        styles.bg,
        styles.text,
        classNames?.root,
        className
      )}
    >
      <span className={cn(classNames?.text)}>
        {displayStatus}
      </span>
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


import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatusBadgeProps {
  status: string;
  description?: string;
  showTooltip?: boolean;
}

export const StatusBadge = ({ status, description, showTooltip = false }: StatusBadgeProps) => {
  const [statusName, setStatusName] = useState<string>(status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'confirm':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'on_the_way':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'service_started':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'done':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const fetchStatusName = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('statusmst')
        .select('status_name')
        .eq('status_code', status)
        .eq('active', true)
        .single();

      if (error) {
        console.error("Error fetching status name:", error);
        return;
      }

      if (data) {
        setStatusName(data.status_name);
      }
    } catch (error) {
      console.error("Error in fetchStatusName:", error);
    }
  }, [status]);

  useEffect(() => {
    fetchStatusName();
  }, [fetchStatusName]);

  const badge = (
    <Badge 
      className={cn(
        "rounded-md font-medium",
        getStatusColor(status)
      )}
    >
      {statusName}
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

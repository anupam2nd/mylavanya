
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "./badge";

export type StatusType = "completed" | "pending" | "cancelled" | "processing" | string;

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusType;
  classNames?: {
    root?: string;
    text?: string;
  };
}

const getStatusStyles = (status: StatusType) => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case "completed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
      };
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
      };
    case "processing":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
      };
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
      };
  }
};

export const StatusBadge = ({ status, classNames, className, ...props }: StatusBadgeProps) => {
  const styles = getStatusStyles(status);
  
  return (
    <Badge
      {...props}
      className={cn(
        "px-3 py-1 rounded-full font-medium border-0",
        styles.bg,
        styles.text,
        classNames?.root,
        className
      )}
    >
      <span className={cn(classNames?.text)}>
        {status.toUpperCase()}
      </span>
    </Badge>
  );
};

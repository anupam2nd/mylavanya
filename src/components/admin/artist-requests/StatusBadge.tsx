
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200',
    selected: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  const displayText = status?.replace('_', ' ').toUpperCase() || 'PENDING';

  return (
    <Badge className={`${colorClass} border`}>
      {displayText}
    </Badge>
  );
}

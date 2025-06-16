
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StatusFilterProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusOptions: { value: string; label: string }[];
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  statusFilter,
  setStatusFilter,
  statusOptions,
}) => {
  console.log("Status options available for filter:", statusOptions);

  // Add "Completed" option if it's not already in the statusOptions
  const allStatusOptions = [
    ...statusOptions,
    // Only add "Completed" if it doesn't already exist
    ...(statusOptions.some(option => option.label.toLowerCase() === 'completed') 
        ? [] 
        : [{ value: 'completed', label: 'Completed' }]
    )
  ];

  return (
    <Select 
      value={statusFilter} 
      onValueChange={(value) => {
        console.log("Selected status filter:", value);
        setStatusFilter(value);
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {allStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

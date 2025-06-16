
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ArtistFilterProps {
  artistFilter: string;
  setArtistFilter: (value: string) => void;
  artistOptions: Array<{ value: string; label: string; empCode?: string }>;
}

export const ArtistFilter: React.FC<ArtistFilterProps> = ({
  artistFilter,
  setArtistFilter,
  artistOptions,
}) => {
  return (
    <Select 
      value={artistFilter} 
      onValueChange={(value) => {
        setArtistFilter(value);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Artist" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Artists</SelectItem>
        {artistOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.empCode && (
                <span className="text-xs text-muted-foreground">{option.empCode}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

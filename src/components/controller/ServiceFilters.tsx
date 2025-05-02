
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Artist {
  ArtistId: number;
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistEmpCode?: string;
}

interface ServiceFiltersProps {
  onFilterByArtist: (artistId: number | null) => void;
  onFilterByStatus: (status: string | null) => void;
}

export const ServiceFilters = ({
  onFilterByArtist,
  onFilterByStatus
}: ServiceFiltersProps) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
    fetchStatuses();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistEmpCode')
        .eq('Active', true);
        
      if (error) {
        console.error("Error fetching artists:", error);
        return;
      }
      
      setArtists(data || []);
    } catch (error) {
      console.error("Unexpected error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      // First try to get from statusmst table
      const { data, error } = await supabase
        .from('statusmst')
        .select('status_code')
        .eq('active', true);
      
      if (error || !data || data.length === 0) {
        // Fallback to distinct statuses from BookMST
        const { data: bookStatuses, error: bookError } = await supabase
          .from('BookMST')
          .select('Status')
          .not('Status', 'is', null);
          
        if (!bookError && bookStatuses) {
          const uniqueStatuses = Array.from(
            new Set(bookStatuses.map(b => b.Status).filter(Boolean))
          );
          setStatuses(uniqueStatuses);
        }
      } else {
        setStatuses(data.map(s => s.status_code));
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const getArtistName = (artist: Artist) => {
    const firstName = artist.ArtistFirstName || '';
    const lastName = artist.ArtistLastName || '';
    const empCode = artist.ArtistEmpCode ? `(${artist.ArtistEmpCode})` : '';
    
    const name = `${firstName} ${lastName}`.trim();
    return name ? `${name} ${empCode}` : `Artist ${artist.ArtistId} ${empCode}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artist-filter">Filter by Artist</Label>
              <Select onValueChange={(value) => onFilterByArtist(value ? parseInt(value, 10) : null)}>
                <SelectTrigger id="artist-filter">
                  <SelectValue placeholder="All Artists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Artists</SelectItem>
                  {artists.map((artist) => (
                    <SelectItem key={artist.ArtistId} value={artist.ArtistId.toString()}>
                      {getArtistName(artist)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select onValueChange={(value) => onFilterByStatus(value || null)}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

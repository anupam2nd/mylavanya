
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Booking } from "@/hooks/useBookings";

interface ArtistAssignmentSelectProps {
  booking: Booking;
  artists: {ArtistId: number; ArtistFirstName: string; ArtistLastName: string}[];
  onArtistAssign: (booking: Booking, artistId: number) => Promise<void>;
}

export const ArtistAssignmentSelect = ({ 
  booking, 
  artists, 
  onArtistAssign 
}: ArtistAssignmentSelectProps) => {
  return (
    <Select
      onValueChange={(value) => onArtistAssign(booking, parseInt(value))}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder="Assign Artist" />
      </SelectTrigger>
      <SelectContent>
        {artists.map((artist) => (
          <SelectItem 
            key={artist.ArtistId} 
            value={artist.ArtistId.toString()}
          >
            {`${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || `Artist #${artist.ArtistId}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

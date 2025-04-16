
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";

interface ArtistAssignmentSelectProps {
  booking: Booking;
  artists: Artist[];
  onArtistAssignment: (artistId: string) => Promise<void>;
  isDisabled: boolean;
}

export const ArtistAssignmentSelect = ({ 
  booking, 
  artists, 
  onArtistAssignment,
  isDisabled
}: ArtistAssignmentSelectProps) => {
  return (
    <Select
      onValueChange={(value) => {
        if (value === "unassigned") {
          // Handle the unassigned case differently if needed
          return;
        }
        onArtistAssignment(value);
      }}
      defaultValue={booking.ArtistId || "unassigned"}
      disabled={isDisabled}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder="Assign Artist" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Select Artist</SelectItem>
        {artists.map((artist) => (
          <SelectItem 
            key={artist.ArtistId} 
            value={artist.ArtistId}
          >
            {`${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || `Artist #${artist.ArtistId}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

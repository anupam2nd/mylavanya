
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { Separator } from "@/components/ui/separator";
import { JobsTable } from "./JobsTable";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";

interface BookingDetailRowProps {
  bookingsGroup: Booking[];
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  isEditingDisabled: boolean;
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: number) => Promise<void>;
  statusOptions: {status_code: string; status_name: string}[];
  artists: {ArtistId: number; ArtistFirstName: string; ArtistLastName: string}[];
  onDeleteJob?: (booking: Booking) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
}

export const BookingDetailRow = ({
  bookingsGroup,
  onEditClick,
  onAddNewJob,
  isEditingDisabled,
  handleStatusChange,
  handleArtistAssignment,
  statusOptions,
  artists,
  onDeleteJob,
  onScheduleChange
}: BookingDetailRowProps) => {
  const mainBooking = bookingsGroup[0];
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  
  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0 border-t-0">
        <div className="bg-muted/20 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
              <div className="flex justify-between items-center">
                <div className="flex-1"></div> {/* Empty div where the header used to be */}
                {!isMember && onAddNewJob && !isEditingDisabled && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onAddNewJob(mainBooking)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add New Job
                    </Button>
                  </div>
                )}
              </div>
              
              <CollapsibleContent>
                <Separator className="my-4" />
                <JobsTable 
                  bookingsGroup={bookingsGroup} 
                  onEditClick={onEditClick} 
                  onDeleteJob={onDeleteJob} 
                  isEditingDisabled={isEditingDisabled}
                  handleStatusChange={handleStatusChange}
                  handleArtistAssignment={handleArtistAssignment}
                  onScheduleChange={onScheduleChange}
                  statusOptions={statusOptions}
                  artists={artists}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

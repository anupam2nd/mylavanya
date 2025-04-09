
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Calendar, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingStatusSelect } from "./BookingStatusSelect";
import { ArtistAssignmentSelect } from "./ArtistAssignmentSelect";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DateTimePicker } from "./DateTimePicker";

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
  const [editingSchedule, setEditingSchedule] = useState<{[key: number]: boolean}>({});
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);
  
  const toggleScheduleEdit = (bookingId: number) => {
    setEditingSchedule(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };
  
  const toggleJobExpand = (jobId: number) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };
  
  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0 border-t-0">
        <div className="bg-muted/20 p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Service Details</h4>
            {onAddNewJob && !isEditingDisabled && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddNewJob(mainBooking)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add New Job
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {bookingsGroup.map((booking) => {
              const isExpanded = expandedJobs.includes(booking.id);
              
              return (
                <div 
                  key={`${booking.id}-${booking.jobno}`}
                  className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium">
                        {booking.jobno ? 
                          `JOB-${booking.jobno.toString().padStart(3, '0')}` : 
                          'N/A'
                        }
                      </div>
                      <div>
                        <span className="text-sm font-medium">{booking.ProductName || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Qty: {booking.Qty || 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={booking.Status || 'pending'} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleJobExpand(booking.id)}
                      >
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-3">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-none">
                          <AccordionTrigger className="py-2">
                            <span className="text-sm font-medium">Service Details</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Service</p>
                                <p className="font-medium">
                                  {[
                                    booking.ServiceName, 
                                    booking.SubService
                                  ].filter(Boolean).join(' > ')}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Product</p>
                                <p className="font-medium">{booking.ProductName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Quantity</p>
                                <p className="font-medium">{booking.Qty || 1}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-medium">₹{booking.price?.toFixed(2) || '0.00'}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2" className="border-none">
                          <AccordionTrigger className="py-2">
                            <span className="text-sm font-medium">Schedule</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            {editingSchedule[booking.id] && onScheduleChange ? (
                              <DateTimePicker 
                                booking={booking}
                                onSave={(date, time) => {
                                  onScheduleChange(booking, date, time);
                                  toggleScheduleEdit(booking.id);
                                }}
                                onCancel={() => toggleScheduleEdit(booking.id)}
                              />
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500">Date</p>
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                    <span>{booking.Booking_date}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Time</p>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                    <span>{booking.booking_time}</span>
                                  </div>
                                </div>
                                {!isEditingDisabled && onScheduleChange && (
                                  <div className="col-span-2 mt-1">
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-6 p-0 text-xs" 
                                      onClick={() => toggleScheduleEdit(booking.id)}
                                    >
                                      Change schedule
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3" className="border-none">
                          <AccordionTrigger className="py-2">
                            <span className="text-sm font-medium">Assignment</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <StatusBadge status={booking.Status || 'pending'} className="mt-1" />
                                {!isEditingDisabled && (
                                  <div className="mt-2">
                                    <BookingStatusSelect
                                      booking={booking}
                                      statusOptions={statusOptions}
                                      onStatusChange={handleStatusChange}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Assigned To</p>
                                <div>{booking.Assignedto || 'Not assigned'}</div>
                                {!isEditingDisabled && (
                                  <div className="mt-2">
                                    <ArtistAssignmentSelect
                                      booking={booking}
                                      artists={artists}
                                      onArtistAssign={handleArtistAssignment}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEditClick(booking)}
                          className="h-8"
                          disabled={isEditingDisabled}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        
                        {!isEditingDisabled && onDeleteJob && bookingsGroup.length > 1 && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => onDeleteJob(booking)}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Search, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { generateBookingReference } from "@/utils/booking/referenceGenerator";
import { getNextAvailableId } from "@/utils/booking/idGenerator";

interface ExternalLead {
  id: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  is_phone_whatsapp: boolean;
  whatsapp_number: string | null;
  selected_service_id: number | null;
  selected_service_name: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadDetails extends ExternalLead {
  sex?: string;
  address?: string;
  pincode?: string;
  preferred_date?: string;
  preferred_time?: string;
  new_service_id?: number;
  new_service_name?: string;
}

interface Service {
  prod_id: number;
  ProductName: string;
  Price: number;
}

const AdminExternalLeads = () => {
  const [leads, setLeads] = useState<ExternalLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('PriceMST')
        .select('prod_id, ProductName, Price')
        .eq('active', true)
        .order('ProductName');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('ExternalLeadMST')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch external leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phonenumber.includes(searchTerm) ||
    (lead.selected_service_name && lead.selected_service_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportData = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Phone Number', 'WhatsApp Same', 'WhatsApp Number', 'Service', 'Created At'].join(','),
      ...filteredLeads.map(lead => [
        lead.firstname,
        lead.lastname,
        lead.phonenumber,
        lead.is_phone_whatsapp ? 'Yes' : 'No',
        lead.whatsapp_number || 'N/A',
        lead.selected_service_name || 'N/A',
        format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `external-leads-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewLead = (lead: ExternalLead) => {
    setSelectedLead({
      ...lead,
      sex: '',
      address: '',
      pincode: '',
      preferred_date: '',
      preferred_time: ''
    });
    setShowViewDialog(true);
  };

  const updateLeadDetails = (field: keyof LeadDetails, value: string | number) => {
    if (selectedLead) {
      setSelectedLead({ ...selectedLead, [field]: value });
    }
  };

  const createBookingFromLead = async () => {
    if (!selectedLead || !selectedLead.new_service_id || !selectedLead.preferred_date || !selectedLead.preferred_time || !selectedLead.address || !selectedLead.pincode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (service, date, time, address, pincode)",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBooking(true);

    try {
      // Generate booking reference and ID
      const bookingRef = await generateBookingReference();
      const nextId = await getNextAvailableId();

      // Format time to 12-hour format for display if needed
      const formatTimeTo12Hour = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      // Create member data
      const memberData = {
        MemberFirstName: selectedLead.firstname,
        MemberLastName: selectedLead.lastname,
        MemberPhNo: selectedLead.phonenumber,
        MemberSex: selectedLead.sex || null,
        MemberAdress: selectedLead.address,
        MemberPincode: selectedLead.pincode,
        whatsapp_number: selectedLead.whatsapp_number || (selectedLead.is_phone_whatsapp ? selectedLead.phonenumber : null),
        MemberStatus: true
      };

      // Insert or update member
      const { data: memberResult, error: memberError } = await supabase
        .from('MemberMST')
        .upsert(memberData, { 
          onConflict: 'MemberPhNo',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Get selected service details
      const selectedService = services.find(s => s.prod_id === selectedLead.new_service_id);
      if (!selectedService) throw new Error('Selected service not found');

      // Create booking data
      const currentTime = new Date();
      const bookingData = {
        id: nextId,
        Product: selectedLead.new_service_id,
        Phone_no: parseInt(selectedLead.phonenumber.replace(/\D/g, '')),
        Booking_date: selectedLead.preferred_date,
        booking_time: formatTimeTo12Hour(selectedLead.preferred_time),
        Status: 'pending',
        StatusUpdated: currentTime.toISOString(),
        price: selectedService.Price,
        Booking_NO: parseInt(bookingRef),
        Qty: 1,
        Address: selectedLead.address,
        Pincode: parseInt(selectedLead.pincode),
        name: `${selectedLead.firstname} ${selectedLead.lastname}`,
        ServiceName: selectedService.ProductName,
        ProductName: selectedService.ProductName,
        jobno: 1,
        Purpose: selectedService.ProductName
      };

      // Insert booking
      const { error: bookingError } = await supabase
        .from('BookMST')
        .insert(bookingData);

      if (bookingError) throw bookingError;

      toast({
        title: "Success",
        description: `Booking created successfully with reference: ${bookingRef}`,
      });
      
      setShowViewDialog(false);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <DashboardLayout title="External Leads">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                View and manage external leads from booking form submissions
              </CardDescription>
            </div>
            <Button onClick={exportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading leads...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.firstname} {lead.lastname}
                        </TableCell>
                        <TableCell>{lead.phonenumber}</TableCell>
                        <TableCell>
                          {lead.is_phone_whatsapp ? (
                            <Badge variant="secondary">Same as phone</Badge>
                          ) : (
                            <span>{lead.whatsapp_number || 'N/A'}</span>
                          )}
                        </TableCell>
                        <TableCell>{lead.selected_service_name || 'N/A'}</TableCell>
                        <TableCell>
                          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewLead(lead)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                View and add additional information for this lead
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={selectedLead.firstname} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={selectedLead.lastname} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={selectedLead.phonenumber} disabled />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input 
                    value={selectedLead.whatsapp_number || (selectedLead.is_phone_whatsapp ? selectedLead.phonenumber : '')} 
                    onChange={(e) => updateLeadDetails('whatsapp_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Input 
                    value={selectedLead.sex || ''} 
                    onChange={(e) => updateLeadDetails('sex', e.target.value)}
                    placeholder="Enter sex"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input 
                    value={selectedLead.pincode || ''} 
                    onChange={(e) => updateLeadDetails('pincode', e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={selectedLead.address || ''} 
                    onChange={(e) => updateLeadDetails('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Date
                  </Label>
                  <Input 
                    type="date"
                    value={selectedLead.preferred_date || ''} 
                    onChange={(e) => updateLeadDetails('preferred_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Time
                  </Label>
                  <Input 
                    type="time"
                    value={selectedLead.preferred_time || ''} 
                    onChange={(e) => updateLeadDetails('preferred_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Selected Service</Label>
                  <Input value={selectedLead.selected_service_name || 'N/A'} disabled />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Add New Service (for booking creation)</Label>
                  <Select
                    value={selectedLead.new_service_id?.toString() || ''}
                    onValueChange={(value) => {
                      const serviceId = parseInt(value);
                      const service = services.find(s => s.prod_id === serviceId);
                      updateLeadDetails('new_service_id', serviceId);
                      updateLeadDetails('new_service_name', service?.ProductName || '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.prod_id} value={service.prod_id.toString()}>
                          {service.ProductName} - ₹{service.Price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Submitted Date</Label>
                  <Input value={format(new Date(selectedLead.created_at), 'dd/MM/yyyy HH:mm')} disabled />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button 
                onClick={createBookingFromLead}
                disabled={isCreatingBooking}
                className="min-w-[120px]"
              >
                {isCreatingBooking ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminExternalLeads;
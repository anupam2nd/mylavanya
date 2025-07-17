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
  services?: Array<{ service_id: number; service_name: string; quantity: number; price: number; }>;
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
      preferred_time: '',
      services: []
    });
    setShowViewDialog(true);
  };

  const updateLeadDetails = (field: keyof LeadDetails, value: string | number) => {
    if (selectedLead) {
      setSelectedLead({ ...selectedLead, [field]: value });
    }
  };

  const addService = () => {
    if (selectedLead) {
      const newServices = [...(selectedLead.services || [])];
      newServices.push({ service_id: 0, service_name: '', quantity: 1, price: 0 });
      setSelectedLead({ ...selectedLead, services: newServices });
    }
  };

  const updateService = (index: number, field: string, value: any) => {
    if (selectedLead && selectedLead.services) {
      const updatedServices = [...selectedLead.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      
      if (field === 'service_id') {
        const service = services.find(s => s.prod_id === value);
        if (service) {
          updatedServices[index].service_name = service.ProductName;
          updatedServices[index].price = service.Price;
        }
      }
      
      setSelectedLead({ ...selectedLead, services: updatedServices });
    }
  };

  const removeService = (index: number) => {
    if (selectedLead && selectedLead.services) {
      const updatedServices = selectedLead.services.filter((_, i) => i !== index);
      setSelectedLead({ ...selectedLead, services: updatedServices });
    }
  };

  const createBookingFromLead = async () => {
    if (!selectedLead || !selectedLead.preferred_date || !selectedLead.preferred_time || !selectedLead.address || !selectedLead.pincode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (date, time, address, pincode)",
        variant: "destructive",
      });
      return;
    }

    // Check if services are selected
    const servicesToBook = selectedLead.services && selectedLead.services.length > 0 
      ? selectedLead.services.filter(s => s.service_id > 0)
      : [];

    // If no services selected, use the original service from the lead
    if (servicesToBook.length === 0) {
      const originalServiceId = selectedLead.new_service_id || selectedLead.selected_service_id;
      const originalService = services.find(s => s.prod_id === originalServiceId);
      if (originalService) {
        servicesToBook.push({
          service_id: originalService.prod_id,
          service_name: originalService.ProductName,
          quantity: 1,
          price: originalService.Price
        });
      }
    }

    if (servicesToBook.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBooking(true);

    try {
      // Generate booking reference and ID
      const bookingRef = await generateBookingReference();
      let nextId = await getNextAvailableId();

      // Format time to 12-hour format for display if needed
      const formatTimeTo12Hour = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      // Hash the phone number to use as password
      const { data: hashedPassword, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: selectedLead.phonenumber }
      });

      if (hashError) throw hashError;

      // Create member data
      const memberData = {
        MemberFirstName: selectedLead.firstname,
        MemberLastName: selectedLead.lastname,
        MemberPhNo: selectedLead.phonenumber,
        MemberSex: selectedLead.sex || null,
        MemberAdress: selectedLead.address,
        MemberPincode: selectedLead.pincode,
        whatsapp_number: selectedLead.whatsapp_number || (selectedLead.is_phone_whatsapp ? selectedLead.phonenumber : null),
        password: hashedPassword.hashedPassword,
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

      // Create bookings for each service
      const currentTime = new Date();
      const bookingPromises = servicesToBook.map(async (service, index) => {
        const bookingData = {
          id: nextId + index,
          Product: service.service_id,
          Phone_no: parseInt(selectedLead.phonenumber.replace(/\D/g, '')),
          Booking_date: selectedLead.preferred_date,
          booking_time: formatTimeTo12Hour(selectedLead.preferred_time),
          Status: 'pending',
          StatusUpdated: currentTime.toISOString(),
          price: service.price * service.quantity,
          Booking_NO: parseInt(bookingRef),
          Qty: service.quantity,
          Address: selectedLead.address,
          Pincode: parseInt(selectedLead.pincode),
          name: `${selectedLead.firstname} ${selectedLead.lastname}`,
          ServiceName: service.service_name,
          ProductName: service.service_name,
          jobno: index + 1,
          Purpose: service.service_name
        };

        return supabase.from('BookMST').insert(bookingData);
      });

      // Execute all booking insertions
      const bookingResults = await Promise.all(bookingPromises);
      
      // Check for any errors
      const bookingErrors = bookingResults.filter(result => result.error);
      if (bookingErrors.length > 0) {
        throw bookingErrors[0].error;
      }

      toast({
        title: "Success",
        description: `${servicesToBook.length} booking(s) created successfully with reference: ${bookingRef}`,
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
                  <Select
                    value={selectedLead.sex || ''}
                    onValueChange={(value) => updateLeadDetails('sex', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="space-y-4 col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Services for Booking</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addService}
                    >
                      Add Service
                    </Button>
                  </div>
                  
                  {selectedLead.services && selectedLead.services.length > 0 ? (
                    <div className="space-y-3">
                      {selectedLead.services.map((service, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-end">
                          <div className="col-span-2">
                            <Label className="text-xs">Service</Label>
                            <Select
                              value={service.service_id.toString()}
                              onValueChange={(value) => updateService(index, 'service_id', parseInt(value))}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((svc) => (
                                  <SelectItem key={svc.prod_id} value={svc.prod_id.toString()}>
                                    {svc.ProductName} - ₹{svc.Price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={service.quantity}
                              onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeService(index)}
                              className="h-8"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                      No services added. Click "Add Service" to add services for booking, or the original service from the lead will be used.
                    </div>
                  )}
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
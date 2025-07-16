import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Search, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
}

const AdminExternalLeads = () => {
  const [leads, setLeads] = useState<ExternalLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

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

  const updateLeadDetails = (field: keyof LeadDetails, value: string) => {
    if (selectedLead) {
      setSelectedLead({ ...selectedLead, [field]: value });
    }
  };

  const saveLeadDetails = async () => {
    if (!selectedLead) return;

    try {
      // Since we can't modify the ExternalLeadMST structure, we'll just show a success message
      // In a real implementation, you might want to create a separate table for extended lead details
      toast({
        title: "Success",
        description: "Lead details viewed successfully",
      });
      setShowViewDialog(false);
    } catch (error) {
      console.error('Error saving lead details:', error);
      toast({
        title: "Error",
        description: "Failed to save lead details",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="External Leads">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">External Leads</h1>
            <p className="text-muted-foreground">
              Manage leads submitted through the booking form
            </p>
          </div>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Management</CardTitle>
            <CardDescription>
              View and manage external leads from booking form submissions
            </CardDescription>
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
                  <Label>Submitted Date</Label>
                  <Input value={format(new Date(selectedLead.created_at), 'dd/MM/yyyy HH:mm')} disabled />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button onClick={saveLeadDetails}>
                Save Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminExternalLeads;
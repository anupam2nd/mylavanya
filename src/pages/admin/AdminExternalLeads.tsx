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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { generateBookingReference } from "@/utils/booking/referenceGenerator";
import { getNextAvailableId } from "@/utils/booking/idGenerator";
import { useAuth } from "@/context/AuthContext";

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
  services?: Array<{ 
    service_id: number; 
    service_name: string; 
    quantity: number; 
    price: number;
    originalPrice: number;
    discount: number;
    netPayable: number;
  }>;
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
  const [servicePricingModes, setServicePricingModes] = useState<Record<number, boolean>>({});
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [rejectedBookings, setRejectedBookings] = useState<any[]>([]);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [selectedRejectedLead, setSelectedRejectedLead] = useState<any>(null);
  const [showRejectedDialog, setShowRejectedDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLeads();
    fetchServices();
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchPendingBookings();
    }
    if (user?.role === 'controller') {
      fetchRejectedBookings();
    }
  }, [user]);

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

  const fetchPendingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('LeadPendingBooking')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingBookings(data || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const fetchRejectedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('LeadPendingBooking')
        .select('*')
        .eq('status', 'rejected')
        .eq('created_by_email', user?.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRejectedBookings(data || []);
    } catch (error) {
      console.error('Error fetching rejected bookings:', error);
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
      newServices.push({ 
        service_id: 0, 
        service_name: '', 
        quantity: 1, 
        price: 0,
        originalPrice: 0,
        discount: 0,
        netPayable: 0
      });
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
          updatedServices[index].originalPrice = service.Price;
          updatedServices[index].netPayable = service.Price;
          updatedServices[index].discount = 0;
        }
      }
      
      setSelectedLead({ ...selectedLead, services: updatedServices });
    }
  };

  const updateServicePricing = (index: number, field: 'price' | 'discount' | 'netPayable', value: string, priceFirst: boolean) => {
    if (selectedLead && selectedLead.services) {
      const updatedServices = [...selectedLead.services];
      const service = updatedServices[index];
      
      if (field === 'price') {
        service.price = parseFloat(value) || 0;
        if (priceFirst && service.discount > 0) {
          service.netPayable = service.price * (1 - service.discount / 100);
        } else if (!priceFirst) {
          service.netPayable = service.price;
        }
      } else if (field === 'discount') {
        service.discount = parseFloat(value) || 0;
        if (priceFirst) {
          service.netPayable = service.price * (1 - service.discount / 100);
        }
      } else if (field === 'netPayable') {
        service.netPayable = parseFloat(value) || 0;
        if (!priceFirst && service.price > 0) {
          service.discount = ((service.price - service.netPayable) / service.price) * 100;
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

  const handleApproval = async (pendingId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('LeadPendingBooking')
        .update({ 
          status,
          approved_by_user_id: user?.id,
          approved_by_email: user?.email,
          approved_at: new Date().toISOString()
        })
        .eq('id', pendingId);

      if (error) throw error;

      // If approved, create the actual booking
      if (status === 'approved') {
        const pendingBooking = pendingBookings.find(p => p.id === pendingId);
        if (pendingBooking) {
          await createBookingFromPending(pendingBooking);
        }
      }

      // Refresh pending bookings
      fetchPendingBookings();
      
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };

  const createBookingFromPending = async (pendingBooking: any) => {
    try {
      const bookingRef = await generateBookingReference();
      let nextId = await getNextAvailableId();

      const formatTimeTo12Hour = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      // Hash the phone number to use as password
      const { data: hashedPassword, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: pendingBooking.customer_phone }
      });

      if (hashError) throw hashError;

      // Get lead data for member creation
      const { data: leadData } = await supabase
        .from('ExternalLeadMST')
        .select('*')
        .eq('id', pendingBooking.lead_id)
        .single();

      if (leadData) {
        // Create member data
        const memberData = {
          MemberFirstName: leadData.firstname,
          MemberLastName: leadData.lastname,
          MemberPhNo: pendingBooking.customer_phone,
          MemberSex: pendingBooking.booking_details?.sex || null,
          MemberAdress: pendingBooking.booking_details?.address,
          MemberPincode: pendingBooking.booking_details?.pincode,
          whatsapp_number: leadData.whatsapp_number || (leadData.is_phone_whatsapp ? leadData.phonenumber : null),
          password: hashedPassword.hashedPassword,
          MemberStatus: true
        };

        // Insert or update member
        await supabase
          .from('MemberMST')
          .upsert(memberData, { 
            onConflict: 'MemberPhNo',
            ignoreDuplicates: false 
          });

        // Create bookings for each service
        const servicesToBook = pendingBooking.service_details || [];
        const currentTime = new Date();
        
        const bookingPromises = servicesToBook.map(async (service: any, index: number) => {
          const bookingData = {
            id: nextId + index,
            Product: service.service_id,
            Phone_no: parseInt(pendingBooking.customer_phone.replace(/\D/g, '')),
            Booking_date: pendingBooking.booking_details?.preferred_date,
            booking_time: formatTimeTo12Hour(pendingBooking.booking_details?.preferred_time),
            Status: 'pending',
            StatusUpdated: currentTime.toISOString(),
            price: service.netPayable * service.quantity,
            Booking_NO: parseInt(bookingRef),
            Qty: service.quantity,
            Address: pendingBooking.booking_details?.address,
            Pincode: parseInt(pendingBooking.booking_details?.pincode),
            name: pendingBooking.booking_details?.customer_name,
            ServiceName: service.service_name,
            ProductName: service.service_name,
            jobno: index + 1,
            Purpose: service.service_name,
            submission_date: new Date(leadData.created_at).toISOString(),
            source: 'campaign',
            campaign_service_selected: leadData.selected_service_name
          };

          return supabase.from('BookMST').insert(bookingData);
        });

        await Promise.all(bookingPromises);

        // Delete the lead from ExternalLeadMST
        await supabase
          .from('ExternalLeadMST')
          .delete()
          .eq('id', pendingBooking.lead_id);

        // Delete the pending booking
        await supabase
          .from('LeadPendingBooking')
          .delete()
          .eq('id', pendingBooking.id);

        // Refresh leads
        fetchLeads();
      }
    } catch (error) {
      console.error('Error creating booking from pending:', error);
      throw error;
    }
  };

  const viewPendingDetails = (pending: any) => {
    // Show a dialog with pending booking details
    toast({
      title: "Pending Booking Details",
      description: `Customer: ${pending.booking_details?.customer_name}\nServices: ${pending.service_details?.length || 0} items\nPrice change: ${pending.percentage?.toFixed(1)}%`,
    });
  };

  const handleModifyRejectedLead = (rejected: any) => {
    setSelectedRejectedLead(rejected);
    setShowRejectedDialog(true);
  };

  const updateRejectedServicePricing = (index: number, field: 'price' | 'discount' | 'netPayable', value: string, priceFirst: boolean) => {
    if (selectedRejectedLead && selectedRejectedLead.service_details) {
      const updatedServices = [...selectedRejectedLead.service_details];
      const service = updatedServices[index];
      
      if (field === 'price') {
        service.price = parseFloat(value) || 0;
        if (priceFirst && service.discount > 0) {
          service.netPayable = service.price * (1 - service.discount / 100);
        } else if (!priceFirst) {
          service.netPayable = service.price;
        }
      } else if (field === 'discount') {
        service.discount = parseFloat(value) || 0;
        if (priceFirst) {
          service.netPayable = service.price * (1 - service.discount / 100);
        }
      } else if (field === 'netPayable') {
        service.netPayable = parseFloat(value) || 0;
        if (!priceFirst && service.price > 0) {
          service.discount = ((service.price - service.netPayable) / service.price) * 100;
        }
      }
      
      setSelectedRejectedLead({ ...selectedRejectedLead, service_details: updatedServices });
    }
  };

  const handleResubmitRejectedLead = async () => {
    if (!selectedRejectedLead) return;

    try {
      const servicesToBook = selectedRejectedLead.service_details || [];
      const totalOriginalPrice = servicesToBook.reduce((sum: number, service: any) => sum + (service.originalPrice * service.quantity), 0);
      const totalModifiedPrice = servicesToBook.reduce((sum: number, service: any) => sum + (service.netPayable * service.quantity), 0);
      
      // Check if prices match original prices
      const pricesMatchOriginal = servicesToBook.every((service: any) => 
        service.netPayable === service.originalPrice
      );

      if (pricesMatchOriginal) {
        // Create booking directly
        await createBookingFromRejected(selectedRejectedLead);
        
        // Delete the rejected booking
        await supabase
          .from('LeadPendingBooking')
          .delete()
          .eq('id', selectedRejectedLead.id);

        // Refresh rejected bookings
        fetchRejectedBookings();
        
        toast({
          title: "Success",
          description: "Booking created successfully with original prices.",
        });
        
        setShowRejectedDialog(false);
      } else {
        // Update the existing record with new prices and change status to pending
        const percentage = ((totalModifiedPrice - totalOriginalPrice) / totalOriginalPrice) * 100;
        
        const { error } = await supabase
          .from('LeadPendingBooking')
          .update({
            status: 'pending',
            modified_price: totalModifiedPrice,
            percentage: percentage,
            service_details: servicesToBook,
            approved_by_user_id: null,
            approved_by_email: null,
            approved_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedRejectedLead.id);

        if (error) throw error;

        // Refresh rejected bookings
        fetchRejectedBookings();
        
        toast({
          title: "Resubmitted for Approval",
          description: "Price changes detected. Booking sent back for admin approval.",
        });
        
        setShowRejectedDialog(false);
      }
    } catch (error) {
      console.error('Error resubmitting rejected lead:', error);
      toast({
        title: "Error",
        description: "Failed to resubmit booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createBookingFromRejected = async (rejectedBooking: any) => {
    try {
      const bookingRef = await generateBookingReference();
      let nextId = await getNextAvailableId();

      const formatTimeTo12Hour = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      // Hash the phone number to use as password
      const { data: hashedPassword, error: hashError } = await supabase.functions.invoke('hash-password', {
        body: { password: rejectedBooking.customer_phone }
      });

      if (hashError) throw hashError;

      // Create member data
      const memberData = {
        MemberFirstName: rejectedBooking.booking_details?.customer_name?.split(' ')[0] || '',
        MemberLastName: rejectedBooking.booking_details?.customer_name?.split(' ').slice(1).join(' ') || '',
        MemberPhNo: rejectedBooking.customer_phone,
        MemberSex: rejectedBooking.booking_details?.sex || null,
        MemberAdress: rejectedBooking.booking_details?.address,
        MemberPincode: rejectedBooking.booking_details?.pincode,
        password: hashedPassword.hashedPassword,
        MemberStatus: true
      };

      // Insert or update member
      await supabase
        .from('MemberMST')
        .upsert(memberData, { 
          onConflict: 'MemberPhNo',
          ignoreDuplicates: false 
        });

      // Create bookings for each service
      const servicesToBook = rejectedBooking.service_details || [];
      const currentTime = new Date();
      
      const bookingPromises = servicesToBook.map(async (service: any, index: number) => {
        const bookingData = {
          id: nextId + index,
          Product: service.service_id,
          Phone_no: parseInt(rejectedBooking.customer_phone.replace(/\D/g, '')),
          Booking_date: rejectedBooking.booking_details?.preferred_date,
          booking_time: formatTimeTo12Hour(rejectedBooking.booking_details?.preferred_time),
          Status: 'pending',
          StatusUpdated: currentTime.toISOString(),
          price: service.netPayable * service.quantity,
          Booking_NO: parseInt(bookingRef),
          Qty: service.quantity,
          Address: rejectedBooking.booking_details?.address,
          Pincode: parseInt(rejectedBooking.booking_details?.pincode),
          name: rejectedBooking.booking_details?.customer_name,
          ServiceName: service.service_name,
          ProductName: service.service_name,
          jobno: index + 1,
          Purpose: service.service_name,
          submission_date: currentTime.toISOString(),
          source: 'campaign'
        };

        return supabase.from('BookMST').insert(bookingData);
      });

      await Promise.all(bookingPromises);
    } catch (error) {
      console.error('Error creating booking from rejected:', error);
      throw error;
    }
  };

  const createBookingFromLead = async () => {
    if (!selectedLead) {
      toast({
        title: "Error",
        description: "No lead selected",
        variant: "destructive",
      });
      return;
    }

    // Check required fields and provide specific error messages
    const missingFields = [];
    if (!selectedLead.preferred_date) missingFields.push("Preferred Date");
    if (!selectedLead.preferred_time) missingFields.push("Preferred Time");
    if (!selectedLead.address || selectedLead.address.trim() === '') missingFields.push("Address");
    if (!selectedLead.pincode || selectedLead.pincode.trim() === '') missingFields.push("Pincode");
    
    console.log('Validation check:', {
      address: selectedLead.address,
      pincode: selectedLead.pincode,
      preferred_date: selectedLead.preferred_date,
      preferred_time: selectedLead.preferred_time,
      missingFields
    });

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
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
          price: originalService.Price,
          originalPrice: originalService.Price,
          discount: 0,
          netPayable: originalService.Price
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

    // Check if controller modified prices and needs approval
    if (user?.role === 'controller') {
      const priceChanged = servicesToBook.some(service => 
        service.netPayable !== service.originalPrice
      );

      if (priceChanged) {
        // Store in LeadPendingBooking for approval
        const totalOriginalPrice = servicesToBook.reduce((sum, service) => sum + (service.originalPrice * service.quantity), 0);
        const totalModifiedPrice = servicesToBook.reduce((sum, service) => sum + (service.netPayable * service.quantity), 0);
        const percentage = ((totalModifiedPrice - totalOriginalPrice) / totalOriginalPrice) * 100;

        try {
          const { error: pendingError } = await supabase
            .from('LeadPendingBooking')
            .insert({
              lead_id: selectedLead.id,
              created_by_controller_id: user.id,
              created_by_email: user.email,
              customer_phone: selectedLead.phonenumber,
              original_price: totalOriginalPrice,
              modified_price: totalModifiedPrice,
              percentage: percentage,
              service_details: servicesToBook,
              booking_details: {
                preferred_date: selectedLead.preferred_date,
                preferred_time: selectedLead.preferred_time,
                address: selectedLead.address,
                pincode: selectedLead.pincode,
                sex: selectedLead.sex,
                customer_name: `${selectedLead.firstname} ${selectedLead.lastname}`
              }
            });

          if (pendingError) throw pendingError;

          // Delete the lead from ExternalLeadMST after storing in pending
          await supabase
            .from('ExternalLeadMST')
            .delete()
            .eq('id', selectedLead.id);

          // Remove from local state
          setLeads(prevLeads => prevLeads.filter(lead => lead.id !== selectedLead.id));

          toast({
            title: "Pending Approval",
            description: "Price changes detected. Booking sent for admin approval.",
            variant: "default",
          });
          
          setShowViewDialog(false);
          return;
        } catch (error) {
          console.error('Error creating pending booking:', error);
          toast({
            title: "Error",
            description: "Failed to submit for approval.",
            variant: "destructive",
          });
          return;
        }
      }
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
          price: service.netPayable * service.quantity,
          Booking_NO: parseInt(bookingRef),
          Qty: service.quantity,
          Address: selectedLead.address,
          Pincode: parseInt(selectedLead.pincode),
          name: `${selectedLead.firstname} ${selectedLead.lastname}`,
          ServiceName: service.service_name,
          ProductName: service.service_name,
          jobno: index + 1,
          Purpose: service.service_name,
          submission_date: new Date(selectedLead.created_at).toISOString(),
          source: 'campaign',
          campaign_service_selected: selectedLead.selected_service_name
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

      // Delete the lead from ExternalLeadMST as booking has been created
      const { error: deleteError } = await supabase
        .from('ExternalLeadMST')
        .delete()
        .eq('id', selectedLead.id);

      if (deleteError) {
        console.error('Error deleting lead:', deleteError);
        toast({
          title: "Warning",
          description: "Booking created but failed to remove lead from external leads",
          variant: "destructive",
        });
      } else {
        // Remove the lead from the local state
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== selectedLead.id));
      }

      toast({
        title: "Success",
        description: `${servicesToBook.length} booking(s) created successfully with reference: ${bookingRef}. Lead removed from external leads.`,
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

        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Price Approvals</CardTitle>
              <CardDescription>
                Review price changes from controllers that require approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending approvals
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Controller</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>Modified Price</TableHead>
                      <TableHead>Change %</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((pending) => (
                      <TableRow key={pending.id}>
                        <TableCell className="font-medium">
                          {pending.booking_details?.customer_name || 'N/A'}
                        </TableCell>
                        <TableCell>{pending.customer_phone}</TableCell>
                        <TableCell>{pending.created_by_email}</TableCell>
                        <TableCell>₹{pending.original_price}</TableCell>
                        <TableCell>₹{pending.modified_price}</TableCell>
                        <TableCell>
                          <Badge variant={pending.percentage > 0 ? 'destructive' : 'secondary'}>
                            {pending.percentage?.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(pending.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(pending.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(pending.id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewPendingDetails(pending)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {user?.role === 'controller' && (
          <Card>
            <CardHeader>
              <CardTitle>Rejected Price Modifications</CardTitle>
              <CardDescription>
                Review and modify prices for rejected booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rejected bookings
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>Last Modified Price</TableHead>
                      <TableHead>Rejected On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedBookings.map((rejected) => (
                      <TableRow key={rejected.id}>
                        <TableCell className="font-medium">
                          {rejected.booking_details?.customer_name || 'N/A'}
                        </TableCell>
                        <TableCell>{rejected.customer_phone}</TableCell>
                        <TableCell>₹{rejected.original_price}</TableCell>
                        <TableCell>₹{rejected.modified_price}</TableCell>
                        <TableCell>
                          {format(new Date(rejected.approved_at || rejected.updated_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyRejectedLead(rejected)}
                          >
                            Modify Price
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                View and add additional information for this lead
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="overflow-y-auto flex-1 pr-2">
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={selectedLead.firstname} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={selectedLead.lastname} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
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
                  <Label>Pincode *</Label>
                  <Input 
                    value={selectedLead.pincode || ''} 
                    onChange={(e) => updateLeadDetails('pincode', e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Address *</Label>
                  <Input 
                    value={selectedLead.address || ''} 
                    onChange={(e) => updateLeadDetails('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Date *
                  </Label>
                  <Input 
                    type="date"
                    value={selectedLead.preferred_date || ''} 
                    onChange={(e) => updateLeadDetails('preferred_date', e.target.value)}
                    min={undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Time *
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
                     <div className="space-y-6">
                       {selectedLead.services.map((service, index) => {
                         const priceFirst = servicePricingModes[index] ?? true;
                         return (
                           <div key={index} className="border rounded-lg p-4 space-y-4">
                             <div className="flex justify-between items-start">
                               <h4 className="font-medium">Service {index + 1}</h4>
                               <Button
                                 type="button"
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => removeService(index)}
                               >
                                 Remove
                               </Button>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label>Service</Label>
                                 <Select
                                   value={service.service_id.toString()}
                                   onValueChange={(value) => updateService(index, 'service_id', parseInt(value))}
                                 >
                                   <SelectTrigger>
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
                               
                               <div className="space-y-2">
                                 <Label>Quantity</Label>
                                 <Input
                                   type="number"
                                   min="1"
                                   value={service.quantity}
                                   onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                                 />
                               </div>
                             </div>

                             {service.service_id > 0 && (
                               <div className="space-y-4 border-t pt-4">
                                 <h5 className="font-medium text-sm">Pricing</h5>
                                 
                                 <div className="grid grid-cols-4 items-center gap-4">
                                   <Label className="text-right">
                                     Price (₹)*
                                   </Label>
                                   <Input
                                     type="number"
                                     value={service.price}
                                     onChange={(e) => updateServicePricing(index, 'price', e.target.value, priceFirst)}
                                     className="col-span-3"
                                   />
                                 </div>
                                 
                                 <div className="grid grid-cols-4 items-center gap-4">
                                   <div className="text-right flex items-center justify-end">
                                     <Label className="mr-2">
                                       Price first
                                     </Label>
                                     <Switch
                                       checked={priceFirst}
                                       onCheckedChange={(checked) => 
                                         setServicePricingModes(prev => ({ ...prev, [index]: checked }))
                                       }
                                     />
                                   </div>
                                   <div className="col-span-3 text-sm text-muted-foreground">
                                     {priceFirst 
                                       ? "Enter price and discount % to calculate net payable" 
                                       : "Enter price and net payable to calculate discount %"}
                                   </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-4 items-center gap-4">
                                   <Label className="text-right">
                                     Discount %
                                   </Label>
                                   <Input
                                     type="number"
                                     value={service.discount}
                                     onChange={(e) => updateServicePricing(index, 'discount', e.target.value, priceFirst)}
                                     className="col-span-3"
                                   />
                                 </div>
                                 
                                 <div className="grid grid-cols-4 items-center gap-4">
                                   <Label className="text-right">
                                     Net Payable (₹)
                                   </Label>
                                   <Input
                                     type="number"
                                     value={service.netPayable}
                                     onChange={(e) => updateServicePricing(index, 'netPayable', e.target.value, priceFirst)}
                                     className="col-span-3"
                                   />
                                 </div>
                               </div>
                             )}
                           </div>
                         );
                       })}
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
            </div>
            )}

            <div className="flex justify-end space-x-2 mt-6 flex-shrink-0">
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

        <Dialog open={showRejectedDialog} onOpenChange={setShowRejectedDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Modify Rejected Booking</DialogTitle>
              <DialogDescription>
                Update prices for this rejected booking request
              </DialogDescription>
            </DialogHeader>

            {selectedRejectedLead && (
              <div className="overflow-y-auto flex-1 pr-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input value={selectedRejectedLead.booking_details?.customer_name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input value={selectedRejectedLead.customer_phone} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Total Price</Label>
                      <Input value={`₹${selectedRejectedLead.original_price}`} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Modified Price</Label>
                      <Input value={`₹${selectedRejectedLead.modified_price}`} disabled />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Services</Label>
                    {selectedRejectedLead.service_details && selectedRejectedLead.service_details.length > 0 ? (
                      <div className="space-y-6">
                        {selectedRejectedLead.service_details.map((service: any, index: number) => {
                          const priceFirst = servicePricingModes[index] ?? true;
                          return (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Service {index + 1}</h4>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Service Name</Label>
                                  <Input value={service.service_name} disabled />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Quantity</Label>
                                  <Input value={service.quantity} disabled />
                                </div>
                              </div>

                              <div className="space-y-4 border-t pt-4">
                                <h5 className="font-medium text-sm">Pricing</h5>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">
                                    Price (₹)*
                                  </Label>
                                  <Input
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => updateRejectedServicePricing(index, 'price', e.target.value, priceFirst)}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div className="text-right flex items-center justify-end">
                                    <Label className="mr-2">
                                      Price first
                                    </Label>
                                    <Switch
                                      checked={priceFirst}
                                      onCheckedChange={(checked) => 
                                        setServicePricingModes(prev => ({ ...prev, [index]: checked }))
                                      }
                                    />
                                  </div>
                                  <div className="col-span-3 text-sm text-muted-foreground">
                                    {priceFirst 
                                      ? "Enter price and discount % to calculate net payable" 
                                      : "Enter price and net payable to calculate discount %"}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">
                                    Discount %
                                  </Label>
                                  <Input
                                    type="number"
                                    value={service.discount}
                                    onChange={(e) => updateRejectedServicePricing(index, 'discount', e.target.value, priceFirst)}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">
                                    Net Payable (₹)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={service.netPayable}
                                    onChange={(e) => updateRejectedServicePricing(index, 'netPayable', e.target.value, priceFirst)}
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                        No services found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6 flex-shrink-0">
              <Button variant="outline" onClick={() => setShowRejectedDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleResubmitRejectedLead}
                className="min-w-[120px]"
              >
                Resubmit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminExternalLeads;
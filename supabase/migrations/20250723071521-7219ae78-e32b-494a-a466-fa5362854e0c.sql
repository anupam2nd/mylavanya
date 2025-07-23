-- Create LeadPendingBooking table for price change approvals
CREATE TABLE public."LeadPendingBooking" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public."ExternalLeadMST"(id),
  created_by_controller_id UUID REFERENCES public."UserMST"(id),
  created_by_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  modified_price NUMERIC NOT NULL,
  percentage NUMERIC,
  service_details JSONB,
  booking_details JSONB,
  approved_by_user_id UUID REFERENCES public."UserMST"(id),
  approved_by_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public."LeadPendingBooking" ENABLE ROW LEVEL SECURITY;

-- Controllers can create and view their own pending bookings
CREATE POLICY "Controllers can create pending bookings" 
ON public."LeadPendingBooking" 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE id = created_by_controller_id 
    AND role = 'controller' 
    AND active = true
  )
);

CREATE POLICY "Controllers can view their own pending bookings" 
ON public."LeadPendingBooking" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE email_id = created_by_email 
    AND role = 'controller' 
    AND active = true
  )
);

-- Admin and SuperAdmin can view, update, and delete all pending bookings
CREATE POLICY "Admin and SuperAdmin can view all pending bookings" 
ON public."LeadPendingBooking" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE role IN ('admin', 'superadmin') 
    AND active = true
  )
);

CREATE POLICY "Admin and SuperAdmin can update pending bookings" 
ON public."LeadPendingBooking" 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE role IN ('admin', 'superadmin') 
    AND active = true
  )
);

CREATE POLICY "Admin and SuperAdmin can delete pending bookings" 
ON public."LeadPendingBooking" 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public."UserMST" 
    WHERE role IN ('admin', 'superadmin') 
    AND active = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lead_pending_booking_updated_at
BEFORE UPDATE ON public."LeadPendingBooking"
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
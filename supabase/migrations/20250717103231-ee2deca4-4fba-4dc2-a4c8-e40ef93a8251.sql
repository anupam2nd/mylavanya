-- Add new columns to BookMST table
ALTER TABLE public."BookMST" 
ADD COLUMN submission_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN source TEXT DEFAULT 'native',
ADD COLUMN campaign_service_selected TEXT;
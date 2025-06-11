
-- Add SubCategory column to PriceMST table (using correct case-sensitive name)
ALTER TABLE public."PriceMST" 
ADD COLUMN "SubCategory" text NULL;

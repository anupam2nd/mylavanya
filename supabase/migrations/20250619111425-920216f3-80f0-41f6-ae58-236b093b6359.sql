
-- Add product_id column to service_sessions table
ALTER TABLE public.service_sessions 
ADD COLUMN product_id bigint;

-- Add foreign key constraint to PriceMST table
ALTER TABLE public.service_sessions 
ADD CONSTRAINT fk_service_sessions_product_id 
FOREIGN KEY (product_id) REFERENCES public."PriceMST"(prod_id);

-- Create index for better performance
CREATE INDEX idx_service_sessions_product_id ON public.service_sessions(product_id);

-- Update the trigger function to include product_id lookup
CREATE OR REPLACE FUNCTION public.handle_service_session_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  artist_email TEXT;
  product_id_value BIGINT;
BEGIN
  -- Get artist email from ArtistMST table
  SELECT emailid INTO artist_email
  FROM public."ArtistMST"
  WHERE "ArtistId" = NEW."ArtistId";

  -- Get product_id by matching ProductName between BookMST and PriceMST
  SELECT prod_id INTO product_id_value
  FROM public."PriceMST"
  WHERE "ProductName" = NEW."ProductName";

  -- Handle Service Started status
  IF NEW."Status" = 'Service Started' AND (OLD."Status" IS NULL OR OLD."Status" != 'Service Started') THEN
    -- Insert new session record
    INSERT INTO public.service_sessions (
      service_id,
      status,
      artist_id,
      product_id,
      service_start_time
    ) VALUES (
      NEW.uuid,
      NEW."Status",
      artist_email,
      product_id_value,
      NOW()
    );
  END IF;

  -- Handle Completed status
  IF NEW."Status" = 'Completed' AND (OLD."Status" IS NULL OR OLD."Status" != 'Completed') THEN
    -- Update existing session record if it exists
    UPDATE public.service_sessions 
    SET 
      status = NEW."Status",
      service_complete_time = NOW(),
      total_service_duration = NOW() - service_start_time,
      product_id = product_id_value,
      updated_at = NOW()
    WHERE service_id = NEW.uuid 
    AND service_complete_time IS NULL;

    -- If no existing record was updated, create a new one
    IF NOT FOUND THEN
      INSERT INTO public.service_sessions (
        service_id,
        status,
        artist_id,
        product_id,
        service_start_time,
        service_complete_time,
        total_service_duration
      ) VALUES (
        NEW.uuid,
        NEW."Status",
        artist_email,
        product_id_value,
        NOW() - INTERVAL '1 hour', -- Default start time if no previous record exists
        NOW(),
        INTERVAL '1 hour' -- Default duration
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

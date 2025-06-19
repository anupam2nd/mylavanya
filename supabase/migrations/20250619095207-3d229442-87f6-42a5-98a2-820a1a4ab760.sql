
-- First, let's add unique constraint to BookMST.uuid column
ALTER TABLE public."BookMST" ADD CONSTRAINT unique_bookmst_uuid UNIQUE (uuid);

-- Create service_sessions table
CREATE TABLE public.service_sessions (
  session_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NULL, -- This will reference BookMST.uuid
  status TEXT NULL,
  artist_id TEXT NULL, -- This will reference ArtistMST.emailid
  service_start_time TIMESTAMP WITH TIME ZONE NULL,
  service_complete_time TIMESTAMP WITH TIME ZONE NULL,
  total_service_duration INTERVAL NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.service_sessions 
ADD CONSTRAINT fk_service_sessions_service_id 
FOREIGN KEY (service_id) REFERENCES public."BookMST"(uuid);

ALTER TABLE public.service_sessions 
ADD CONSTRAINT fk_service_sessions_artist_id 
FOREIGN KEY (artist_id) REFERENCES public."ArtistMST"(emailid);

-- Create indexes for better performance
CREATE INDEX idx_service_sessions_service_id ON public.service_sessions(service_id);
CREATE INDEX idx_service_sessions_artist_id ON public.service_sessions(artist_id);
CREATE INDEX idx_service_sessions_status ON public.service_sessions(status);

-- Create trigger function to handle service session tracking
CREATE OR REPLACE FUNCTION public.handle_service_session_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  artist_email TEXT;
BEGIN
  -- Get artist email from ArtistMST table
  SELECT emailid INTO artist_email
  FROM public."ArtistMST"
  WHERE "ArtistId" = NEW."ArtistId";

  -- Handle Service Started status
  IF NEW."Status" = 'Service Started' AND (OLD."Status" IS NULL OR OLD."Status" != 'Service Started') THEN
    -- Insert new session record
    INSERT INTO public.service_sessions (
      service_id,
      status,
      artist_id,
      service_start_time
    ) VALUES (
      NEW.uuid,
      NEW."Status",
      artist_email,
      NOW()
    );
  END IF;

  -- Handle Completed status
  IF NEW."Status" = 'Completed' AND (OLD."Status" IS NULL OR OLD."Status" != 'Completed') THEN
    -- Update existing session record or create new one if it doesn't exist
    INSERT INTO public.service_sessions (
      service_id,
      status,
      artist_id,
      service_start_time,
      service_complete_time,
      total_service_duration
    ) VALUES (
      NEW.uuid,
      NEW."Status",
      artist_email,
      COALESCE(
        (SELECT service_start_time FROM public.service_sessions WHERE service_id = NEW.uuid LIMIT 1),
        NOW() - INTERVAL '1 hour' -- Default start time if no previous record exists
      ),
      NOW(),
      NOW() - COALESCE(
        (SELECT service_start_time FROM public.service_sessions WHERE service_id = NEW.uuid LIMIT 1),
        NOW() - INTERVAL '1 hour'
      )
    )
    ON CONFLICT (session_id) DO NOTHING;

    -- If record already exists, update it
    UPDATE public.service_sessions 
    SET 
      status = NEW."Status",
      service_complete_time = NOW(),
      total_service_duration = NOW() - service_start_time,
      updated_at = NOW()
    WHERE service_id = NEW.uuid 
    AND service_complete_time IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on BookMST table
CREATE TRIGGER trigger_service_session_tracking
  AFTER UPDATE OF "Status" ON public."BookMST"
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_service_session_tracking();

-- Enable Row Level Security (optional - if you want to restrict access)
ALTER TABLE public.service_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow authenticated users to view service sessions
CREATE POLICY "Allow authenticated users to view service sessions"
  ON public.service_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policy to allow system to insert/update service sessions
CREATE POLICY "Allow system to manage service sessions"
  ON public.service_sessions
  FOR ALL
  TO service_role
  USING (true);

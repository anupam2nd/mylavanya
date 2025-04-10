
-- First check if the table already has been altered to TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'wishlist'
        AND column_name = 'user_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE 'Column user_id is already of type TEXT. No change needed.';
    ELSE
        -- Alter the user_id column to TEXT type if it's not already
        ALTER TABLE public.wishlist
        ALTER COLUMN user_id TYPE TEXT;
        
        RAISE NOTICE 'Column user_id has been changed to TEXT type.';
    END IF;
END$$;

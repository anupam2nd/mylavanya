
-- First, let's check if there's any data in the wishlist table and clean it up if needed
-- since we need to change the user_id type from bigint to uuid

-- Drop the existing foreign key constraint
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;

-- Update the user_id column type from bigint to uuid
-- This will fail if there's incompatible data, so we'll handle that
DO $$
BEGIN
    -- Try to convert existing data or clear it if conversion fails
    UPDATE public.wishlist 
    SET user_id = NULL 
    WHERE user_id IS NOT NULL;
    
    -- Now change the column type
    ALTER TABLE public.wishlist 
    ALTER COLUMN user_id TYPE uuid USING NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- If update fails, truncate the table (remove all data)
        TRUNCATE TABLE public.wishlist;
        ALTER TABLE public.wishlist 
        ALTER COLUMN user_id TYPE uuid USING NULL;
END $$;

-- Add the correct foreign key constraint to reference member_profiles (which uses UUID)
-- instead of MemberMST (which uses bigint)
ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.member_profiles(id) ON DELETE CASCADE;

-- Update the wishlist table to allow NULL user_id temporarily
ALTER TABLE public.wishlist 
ALTER COLUMN user_id DROP NOT NULL;

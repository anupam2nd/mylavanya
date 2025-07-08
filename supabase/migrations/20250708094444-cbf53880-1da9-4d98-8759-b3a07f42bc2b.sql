
-- Update wishlist table to use UUID for user_id instead of bigint
ALTER TABLE public.wishlist 
ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

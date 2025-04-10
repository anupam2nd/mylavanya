
-- Update the wishlist table to allow for various user_id types
ALTER TABLE public.wishlist
  ALTER COLUMN user_id TYPE TEXT;

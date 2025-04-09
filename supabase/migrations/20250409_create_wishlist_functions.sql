
-- Create function to get user wishlist with service details
CREATE OR REPLACE FUNCTION public.get_user_wishlist(user_uuid UUID)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', w.id,
    'user_id', w.user_id,
    'service_id', w.service_id,
    'created_at', w.created_at,
    'service_name', p."ProductName",
    'service_price', p."Price",
    'service_category', p."Category",
    'service_description', p."Description"
  )
  FROM wishlist w
  JOIN "PriceMST" p ON w.service_id = p.prod_id
  WHERE w.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to add item to wishlist
CREATE OR REPLACE FUNCTION public.add_to_wishlist(
  service_id_param INTEGER,
  user_id_param UUID
) RETURNS void AS $$
BEGIN
  INSERT INTO wishlist (service_id, user_id)
  VALUES (service_id_param, user_id_param);
END;
$$ LANGUAGE plpgsql;

-- Create function to remove item from wishlist
CREATE OR REPLACE FUNCTION public.remove_from_wishlist(
  wishlist_id_param INTEGER,
  user_id_param UUID
) RETURNS void AS $$
BEGIN
  DELETE FROM wishlist
  WHERE id = wishlist_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

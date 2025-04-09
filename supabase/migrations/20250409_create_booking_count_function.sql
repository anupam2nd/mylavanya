
CREATE OR REPLACE FUNCTION public.get_booking_counts_by_status()
RETURNS TABLE(status text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT "Status" as status, COUNT(*) as count
  FROM "BookMST"
  GROUP BY "Status";
END;
$$ LANGUAGE plpgsql;

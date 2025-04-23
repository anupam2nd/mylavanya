
-- Create a function to get column names with their original case
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE(
  column_name text,
  data_type text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.attname::text as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod)::text as data_type
  FROM 
    pg_catalog.pg_attribute a
  JOIN 
    pg_catalog.pg_class c ON a.attrelid = c.oid
  JOIN 
    pg_catalog.pg_namespace n ON c.relnamespace = n.oid
  WHERE 
    c.relname = table_name
    AND a.attnum > 0 
    AND NOT a.attisdropped
  ORDER BY 
    a.attnum;
END;
$$;

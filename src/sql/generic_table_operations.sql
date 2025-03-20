
-- SQL functions to support dynamic table operations
-- Note: These functions need to be executed in Supabase SQL Editor

-- Function to get a list of user tables
CREATE OR REPLACE FUNCTION get_user_tables()
RETURNS TABLE (table_name text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE '_%;'
  ORDER BY t.table_name;
END;
$$;

-- Function to get columns for a specific table
CREATE OR REPLACE FUNCTION get_table_columns(p_table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- Function to get a record by ID from any table
CREATE OR REPLACE FUNCTION get_record_by_id(p_table_name text, p_record_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  query text;
BEGIN
  query := 'SELECT to_jsonb(t) FROM ' || quote_ident(p_table_name) || 
           ' t WHERE id = $1 LIMIT 1';
  
  EXECUTE query INTO result USING p_record_id;
  
  RETURN result;
END;
$$;

-- Function to update a record
CREATE OR REPLACE FUNCTION update_record(p_table_name text, p_record_id bigint, p_record_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query text;
  rec record;
  col_names text := '';
  col_values text := '';
BEGIN
  -- Build the set clause for each field in p_record_data
  FOR rec IN SELECT * FROM jsonb_each(p_record_data)
  LOOP
    IF col_names = '' THEN
      col_names := quote_ident(rec.key);
      col_values := '$1->' || quote_literal(rec.key);
    ELSE
      col_names := col_names || ', ' || quote_ident(rec.key);
      col_values := col_values || ', $1->' || quote_literal(rec.key);
    END IF;
  END LOOP;
  
  query := 'UPDATE ' || quote_ident(p_table_name) || 
           ' SET (' || col_names || ') = ROW(' || col_values || ') ' ||
           ' WHERE id = $2';
  
  EXECUTE query USING p_record_data, p_record_id;
END;
$$;

-- Function to insert a new record
CREATE OR REPLACE FUNCTION insert_record(p_table_name text, p_record_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query text;
  rec record;
  col_names text := '';
  col_values text := '';
BEGIN
  -- Build the column and value lists for each field in p_record_data
  FOR rec IN SELECT * FROM jsonb_each(p_record_data)
  LOOP
    IF col_names = '' THEN
      col_names := quote_ident(rec.key);
      col_values := '$1->' || quote_literal(rec.key);
    ELSE
      col_names := col_names || ', ' || quote_ident(rec.key);
      col_values := col_values || ', $1->' || quote_literal(rec.key);
    END IF;
  END LOOP;
  
  query := 'INSERT INTO ' || quote_ident(p_table_name) || 
           ' (' || col_names || ') VALUES (';
  
  -- Add the JSON expression for each field
  query := query || col_values || ')';
  
  EXECUTE query USING p_record_data;
END;
$$;

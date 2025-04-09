
-- Create an RPC function to insert notifications
CREATE OR REPLACE FUNCTION public.insert_notification(
  p_recipient_email TEXT,
  p_booking_id INTEGER,
  p_booking_no TEXT,
  p_message TEXT,
  p_change_type TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    recipient_email,
    booking_id,
    booking_no,
    message,
    created_at,
    is_read,
    change_type
  ) VALUES (
    p_recipient_email,
    p_booking_id,
    p_booking_no,
    p_message,
    now(),
    false,
    p_change_type
  );
END;
$$ LANGUAGE plpgsql;


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: number;
  booking_id: number;
  booking_no: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  change_type: string;
}

export function useNotifications(userEmail: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("recipient_email", userEmail)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setNotifications(data as Notification[]);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      });
  }, [userEmail]);

  // Optionally, add real-time listening here in the future for instant updates

  return { notifications, loading };
}

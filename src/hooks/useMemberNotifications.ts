
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface MemberNotification {
  id: number;
  recipient_email: string;
  booking_id: number;
  booking_no: string;
  message: string;
  is_read: boolean;
  change_type: string;
  created_at: string;
}

export const useMemberNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_email", user.email)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err: any) {
      setError("Failed to fetch notifications.");
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read (i.e., dismissed)
  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      // Update frontend state quickly
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      setError("Failed to mark as read.");
      console.error("Notification markAsRead error:", err);
    }
  };

  return { notifications, loading, error, markAsRead, refetch: fetchNotifications };
};

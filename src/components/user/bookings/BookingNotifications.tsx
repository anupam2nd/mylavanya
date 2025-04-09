
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface Notification {
  id: number;
  recipient_email: string;
  booking_id: number;
  booking_no: string;
  message: string;
  created_at: string;
  is_read: boolean;
  change_type: string;
}

export const BookingNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Use a more generic approach that doesn't rely on specific types
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_email', user.email)
          .eq('is_read', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Cast data to Notification type
        setNotifications((data || []) as Notification[]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to changes
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_email=eq.${user.email}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: number) => {
    try {
      // Use a more generic approach without relying on types
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) => 
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) return null;
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          className="relative border-blue-200 bg-blue-50"
          onClick={() => markAsRead(notification.id)}
        >
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Booking Updated</AlertTitle>
          <AlertDescription className="text-blue-700">
            {notification.message}
          </AlertDescription>
          <button 
            className="absolute top-2 right-2 text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(notification.id);
            }}
          >
            Dismiss
          </button>
        </Alert>
      ))}
    </div>
  );
};

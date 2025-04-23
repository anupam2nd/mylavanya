
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsBellProps {
  userEmail: string | undefined;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ userEmail }) => {
  const [open, setOpen] = useState(false);
  const { notifications, loading } = useNotifications(userEmail);

  // Show only the 5 latest unread notifications
  const unread = notifications.filter((n) => !n.is_read);
  const displayNotifications = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-primary" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unread.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="border-b px-4 py-2 font-semibold text-gray-900 bg-gray-50">Notifications</div>
        <div className="max-h-72 overflow-auto">
          {loading ? (
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No notifications.</div>
          ) : (
            displayNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b last:border-0 cursor-pointer ${
                  !notif.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-sm text-gray-700">{notif.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

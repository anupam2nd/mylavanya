
import React, { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemberNotifications } from "@/hooks/useMemberNotifications";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const MemberNotifications = () => {
  const { notifications, loading, markAsRead } = useMemberNotifications();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.booking_id) {
      navigate(`/admin/bookings?booking=${notification.booking_no}`);
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'new_booking':
        return 'bg-blue-50 text-blue-800';
      case 'booking_completed':
        return 'bg-green-50 text-green-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start space-y-1 p-4 cursor-pointer ${
                  !notification.is_read ? getNotificationStyle(notification.change_type) : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="font-medium">{notification.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

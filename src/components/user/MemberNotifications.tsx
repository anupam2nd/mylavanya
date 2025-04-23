
import React from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useMemberNotifications } from "@/hooks/useMemberNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const importantChangeType = "artist_on_the_way";
const alertTitle = "Our Employee Is On The Way";
const additionalText = "Please be ready or available at the location on time. Our Artist will visit you shortly.";

export const MemberNotifications = () => {
  const { notifications, loading, error, markAsRead } = useMemberNotifications();

  // Show only unread notifications, most recent top
  const unreadNotifications = notifications.filter(notif => !notif.is_read);

  const hasImportant = unreadNotifications.some(n => n.change_type === importantChangeType);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center group" aria-label="View notifications">
          <Bell className="w-6 h-6 text-primary" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-0 border-0 shadow-xl">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-primary/5">
            <span className="font-semibold text-lg text-primary">Notifications</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {loading && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}
            {error && <div className="p-4 text-sm text-destructive">{error}</div>}
            {!loading && unreadNotifications.length === 0 && (
              <div className="p-4 text-muted-foreground">No new notifications</div>
            )}
            {unreadNotifications.map((notif) => {
              const isAlert = notif.change_type === importantChangeType;
              let artistName = ""; // Extract artist name from message if available.
              const match = notif.message.match(/artist ([^ ]+)/i);
              if (match) artistName = match[1];

              return (
                <div
                  key={notif.id}
                  className={`p-4 ${isAlert ? "bg-red-50 border-l-4 border-red-500" : ""} flex items-start gap-3`}
                >
                  <div className="flex-shrink-0">
                    {isAlert ? (
                      <CheckCircle2 className="h-6 w-6 text-red-500 mt-1" />
                    ) : (
                      <Bell className="h-5 w-5 text-primary mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    {isAlert && (
                      <div className="font-bold text-base text-red-800 mb-1">{alertTitle}</div>
                    )}
                    <div className="text-sm text-gray-700 whitespace-pre-line">{notif.message}</div>
                    {isAlert && (
                      <div className="mt-2 text-xs text-red-600">{additionalText}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Booking #{notif.booking_no}
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-3">
                    <Button
                      size="sm"
                      variant={isAlert ? "destructive" : "ghost"}
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MemberNotifications;

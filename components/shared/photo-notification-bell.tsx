'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Image as ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePhotoNotifications } from '@/hooks/use-photo-notifications';

interface PhotoNotificationBellProps {
  userId: string;
}

export function PhotoNotificationBell({ userId }: PhotoNotificationBellProps) {
  const { notifications, unreadCount, markAsRead } = usePhotoNotifications({
    userId,
    userRole: 'owner',
  });
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold">Obavijesti</span>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {notifications.length} novo
            </span>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nema novih obavijesti</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id}>
                <Link
                  href={`/azuriranja/${notification.bookingId}`}
                  className="flex items-start gap-3 px-3 py-3 cursor-pointer w-full"
                >
                  <Image
                    src={notification.photoUrl}
                    alt="Photo"
                    width={48}
                    height={48}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Nova fotografija {notification.petName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.sitterName}: {notification.caption}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 5 && (
              <div className="px-3 py-2 text-center border-t">
                <Link
                  href="/dashboard/vlasnik"
                  className="text-sm text-orange-600 hover:underline"
                >
                  Pogledaj sve obavijesti
                </Link>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { PetUpdate } from '@/lib/types';

interface UsePhotoNotificationsProps {
  userId: string;
  userRole: 'owner' | 'sitter';
}

interface PhotoNotification {
  id: string;
  bookingId: string;
  petName: string;
  sitterName: string;
  photoUrl: string;
  caption: string;
}

export function usePhotoNotifications({ userId, userRole }: UsePhotoNotificationsProps) {
  const [notifications, setNotifications] = useState<PhotoNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Subscribe to new pet updates
  useEffect(() => {
    if (userRole !== 'owner') return;

    const channel = supabase
      .channel('photo-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pet_updates',
        },
        async (payload) => {
          const update = payload.new as PetUpdate;
          
          // Only notify for photo/video updates
          if (update.type !== 'photo' && update.type !== 'video') return;
          if (!update.photo_url) return;

          // Get booking details to verify ownership
          const { data: booking } = await supabase
            .from('bookings')
            .select('owner_id, pet_id, sitter_id')
            .eq('id', update.booking_id)
            .single();

          if (!booking || booking.owner_id !== userId) return;

          // Get pet and sitter names
          const [{ data: pet }, { data: sitter }] = await Promise.all([
            supabase.from('pets').select('name').eq('id', booking.pet_id).single(),
            supabase.from('users').select('name').eq('id', booking.sitter_id).single(),
          ]);

          const notification: PhotoNotification = {
            id: update.id,
            bookingId: update.booking_id,
            petName: pet?.name || 'Ljubimac',
            sitterName: sitter?.name || 'Sitter',
            photoUrl: update.photo_url,
            caption: update.caption,
          };

          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((count) => count + 1);

          // Show toast notification
          toast.success(`Nova fotografija od ${sitter?.name || 'sittera'}!`, {
            description: `${pet?.name || 'Ljubimac'}: ${update.caption.substring(0, 50)}${update.caption.length > 50 ? '...' : ''}`,
            duration: 5000,
            action: {
              label: 'Pogledaj',
              onClick: () => {
                window.location.href = `/azuriranja/${update.booking_id}`;
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, supabase]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
  };
}

import { STATUS_LABELS, type BookingStatus } from '@/lib/types';

export const dashboardBookingStatusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const dashboardBookingStatusDotColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-400',
  accepted: 'bg-blue-400',
  rejected: 'bg-red-400',
  completed: 'bg-green-400',
  cancelled: 'bg-gray-400',
};

export const dashboardBookingStatusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: STATUS_LABELS.pending, color: dashboardBookingStatusColors.pending },
  accepted: { label: STATUS_LABELS.accepted, color: dashboardBookingStatusColors.accepted },
  rejected: { label: STATUS_LABELS.rejected, color: dashboardBookingStatusColors.rejected },
  completed: { label: STATUS_LABELS.completed, color: dashboardBookingStatusColors.completed },
  cancelled: { label: STATUS_LABELS.cancelled, color: dashboardBookingStatusColors.cancelled },
};

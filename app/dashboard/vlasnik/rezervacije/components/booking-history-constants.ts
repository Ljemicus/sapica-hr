import { STATUS_LABELS } from '@/lib/types';
import { dashboardBookingStatusConfig } from '@/app/dashboard/shared/dashboard-booking-status';
import type { FilterTab } from './booking-history-types';

export const statusConfig = dashboardBookingStatusConfig;

export const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'sve', label: 'Sve' },
  { key: 'u_tijeku', label: 'U tijeku' },
  { key: 'zavrsene', label: 'Završene' },
  { key: 'otkazane', label: 'Otkazane' },
];

export const sitterGradients: Record<string, string> = {
  A: 'from-orange-400 to-amber-300',
  M: 'from-teal-400 to-cyan-300',
  I: 'from-purple-400 to-pink-300',
  T: 'from-blue-400 to-indigo-300',
  P: 'from-rose-400 to-pink-300',
  L: 'from-green-400 to-emerald-300',
};

export const GROOMING_SERVICE_LABELS: Record<string, string> = {
  sisanje: 'Šišanje',
  kupanje: 'Kupanje',
  trimanje: 'Trimanje',
  nokti: 'Nokti',
  cetkanje: 'Četkanje',
};

export const GROOMING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: STATUS_LABELS.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: STATUS_LABELS.rejected, color: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: STATUS_LABELS.completed, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: STATUS_LABELS.cancelled, color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

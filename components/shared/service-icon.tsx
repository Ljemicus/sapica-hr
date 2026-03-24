import { Home, Dog, House, Eye, Sun } from 'lucide-react';
import type { ServiceType } from '@/lib/types';

const icons: Record<ServiceType, React.ElementType> = {
  'boarding': Home,
  'walking': Dog,
  'house-sitting': House,
  'drop-in': Eye,
  'daycare': Sun,
};

interface ServiceIconProps {
  service: ServiceType;
  className?: string;
}

export function ServiceIcon({ service, className }: ServiceIconProps) {
  const Icon = icons[service];
  return <Icon className={className} />;
}

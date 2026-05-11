import Image from 'next/image';
import { cn } from '@/lib/utils';

type PetParkLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function PetParkLogo({
  className,
  width = 148,
  height = 44,
  priority = false,
}: PetParkLogoProps) {
  return (
    <Image
      src="/brand/petpark-logo.svg"
      alt="PetPark"
      width={width}
      height={height}
      priority={priority}
      className={cn('h-auto w-auto', className)}
    />
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DonationButtonProps {
  appealId: string;
  appealSlug: string;
  donationUrl: string;
  disabled?: boolean;
}

export function DonationButton({ appealId, appealSlug, donationUrl, disabled }: DonationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/appeals/donation-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealId, appealSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Previše pokušaja. Pokušajte kasnije.');
        } else {
          console.error('Failed to track donation click:', data.error);
        }
        // Continue to donation link even if tracking fails
      }

      // Open donation URL in new tab
      window.open(donationUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking donation click:', error);
      // Open donation URL even if tracking fails
      window.open(donationUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="gap-2" 
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Učitavanje...
        </>
      ) : (
        <>
          Doniraj izravno organizaciji <ExternalLink className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

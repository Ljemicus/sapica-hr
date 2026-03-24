'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
  petName: string;
  city: string;
  petId: string;
  size?: 'sm' | 'lg';
}

export function ShareButtons({ petName, city, petId, size = 'sm' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/izgubljeni/${petId}`;
  const text = `IZGUBLJEN: ${petName} u ${city}. Pomozi pronaći! 🐾`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      toast.success('Link kopiran!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nije moguće kopirati link');
    }
  };

  const isLarge = size === 'lg';
  const btnSize = isLarge ? 'default' : 'sm';
  const iconSize = isLarge ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className={`flex gap-2 ${isLarge ? 'flex-wrap' : ''}`}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button size={btnSize} className={`w-full bg-[#25D366] hover:bg-[#1fb855] text-white font-bold ${isLarge ? 'py-5 text-base' : ''}`}>
          <MessageCircle className={`${iconSize} mr-1.5`} />
          WhatsApp
        </Button>
      </a>
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button size={btnSize} className={`w-full bg-[#1877F2] hover:bg-[#1565d8] text-white font-bold ${isLarge ? 'py-5 text-base' : ''}`}>
          <svg className={iconSize + ' mr-1.5'} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </Button>
      </a>
      {isLarge && (
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size={btnSize} className={`w-full bg-black hover:bg-gray-800 text-white font-bold ${isLarge ? 'py-5 text-base' : ''}`}>
            <svg className={iconSize + ' mr-1.5'} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter
          </Button>
        </a>
      )}
      <Button size={btnSize} variant="outline" onClick={handleCopy} className={`${isLarge ? 'flex-1 py-5 text-base font-bold' : ''}`}>
        {copied ? <Check className={iconSize} /> : <Copy className={`${iconSize} mr-1.5`} />}
        {copied ? '' : (isLarge ? 'Kopiraj link' : '')}
      </Button>
    </div>
  );
}

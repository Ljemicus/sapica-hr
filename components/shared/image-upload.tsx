'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: 'avatars' | 'pet-photos';
  userId: string;
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
  variant?: 'avatar' | 'square';
  fallbackText?: string;
  className?: string;
}

export function ImageUpload({
  bucket,
  userId,
  currentImageUrl,
  onUploadComplete,
  variant = 'avatar',
  fallbackText = '?',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Slika je prevelika. Maksimalna veličina je 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Molimo odaberite slikovnu datoteku.');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      toast.success('Slika uspješno postavljena!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Greška pri postavljanju slike. Pokušajte ponovo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />

      {variant === 'avatar' ? (
        <div className="relative group">
          <Avatar className="h-24 w-24 ring-2 ring-orange-100">
            <AvatarImage src={preview || ''} alt="Profilna slika" />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-2xl">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      ) : (
        <div className="relative group">
          <div className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Slika ljubimca" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400 text-sm p-2">
                <Camera className="h-8 w-8 mx-auto mb-1" />
                Dodaj sliku
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="h-9 w-9 bg-white/20 hover:bg-white/40 text-white"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
            {preview && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleRemove}
                className="h-9 w-9 bg-white/20 hover:bg-red-500/60 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

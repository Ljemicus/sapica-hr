'use client';

import { useState, useRef, useCallback, useId } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  uploadAvatar,
  uploadPetPhoto,
  uploadMessageAttachment,
  createPreviewUrl,
  validateFile,
  type UploadResult,
} from '@/lib/upload';

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  result?: UploadResult;
}

type UploadBucket = 'avatars' | 'pet-photos' | 'messages' | 'generic';

interface ImageUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  variant?: 'avatar' | 'square' | 'dropzone';
  currentImageUrl?: string | null;
  fallbackText?: string;
  className?: string;
  /** Bucket za upload — određuje koju funkciju koristiti */
  bucket?: UploadBucket;
  /** ID entiteta (userId za avatare, petId za pet-photos, userId za messages) */
  entityId?: string;
}

async function performUpload(file: File, bucket: UploadBucket, entityId: string): Promise<UploadResult> {
  switch (bucket) {
    case 'avatars':
      return uploadAvatar(entityId, file);
    case 'pet-photos':
      return uploadPetPhoto(entityId, file);
    case 'messages':
      return uploadMessageAttachment(entityId, file);
    default:
      // TODO: Create a dedicated Supabase Storage bucket for generic uploads
      // For now, return a local blob URL as preview
      return {
        url: URL.createObjectURL(file),
        fileName: file.name,
        size: file.size,
      };
  }
}

export function ImageUpload({
  onUploadComplete,
  maxFiles = 5,
  variant = 'dropzone',
  currentImageUrl,
  fallbackText = '?',
  className = '',
  bucket = 'generic',
  entityId = 'anonymous',
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentImageUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: File[] = Array.from(fileList);
    const totalAfter = files.length + newFiles.length;

    if (totalAfter > maxFiles) {
      toast.error(`Maksimalno ${maxFiles} slika.`);
      return;
    }

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const id = Math.random().toString(36).substring(2, 8);
      const previewUrl = createPreviewUrl(file);

      const uploadedFile: UploadedFile = {
        id,
        file,
        previewUrl,
        progress: 0,
        status: 'uploading',
      };

      setFiles((prev) => [...prev, uploadedFile]);

      // Progress animation
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id && f.progress < 90
              ? { ...f, progress: f.progress + Math.random() * 15 }
              : f
          )
        );
      }, 200);

      try {
        const result = await performUpload(file, bucket, entityId);
        clearInterval(progressInterval);
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === id ? { ...f, progress: 100, status: 'done' as const, result } : f
          );
          // Notify parent with real URLs
          if (onUploadComplete) {
            const urls = updated
              .filter((f) => f.status === 'done' && f.result)
              .map((f) => f.result!.url);
            setTimeout(() => onUploadComplete(urls), 0);
          }
          return updated;
        });
      } catch {
        clearInterval(progressInterval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: 'error' } : f
          )
        );
        toast.error(`Greška pri uploadu: ${file.name}`);
      }
    }
  }, [files.length, maxFiles, bucket, entityId, onUploadComplete]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      const updated = prev.filter((f) => f.id !== id);
      if (onUploadComplete) {
        const urls = updated
          .filter((f) => f.status === 'done' && f.result)
          .map((f) => f.result!.url);
        setTimeout(() => onUploadComplete(urls), 0);
      }
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (variant === 'avatar') {
        handleAvatarUpload(e.target.files[0]);
      } else {
        processFiles(e.target.files);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAvatarUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }

    setAvatarUploading(true);
    setAvatarProgress(0);
    const previewUrl = createPreviewUrl(file);
    setAvatarPreview(previewUrl);

    const interval = setInterval(() => {
      setAvatarProgress((p) => Math.min(p + Math.random() * 20, 90));
    }, 200);

    try {
      const result = await performUpload(file, bucket === 'generic' ? 'avatars' : bucket, entityId);
      clearInterval(interval);
      setAvatarProgress(100);
      toast.success('Slika postavljena!');
      onUploadComplete?.([result.url]);
    } catch {
      clearInterval(interval);
      toast.error('Greška pri uploadu');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Avatar variant ──
  if (variant === 'avatar') {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 opacity-0 pointer-events-none"
        />
        <label htmlFor={inputId} className="relative group cursor-pointer block">
          <div className="relative h-24 w-24 rounded-full ring-2 ring-orange-100 overflow-hidden bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
            ) : (
              <span className="text-white text-2xl font-bold">{fallbackText}</span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {avatarUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6 text-white" />
            )}
          </div>
          {avatarUploading && (
            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${avatarProgress}%` }}
              />
            </div>
          )}
        </label>
      </div>
    );
  }

  // ── Square variant ──
  if (variant === 'square') {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 opacity-0 pointer-events-none"
        />
        <label
          htmlFor={inputId}
          className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer group hover:border-orange-300 transition-colors"
        >
          {avatarPreview ? (
            <div className="relative w-full h-full">
              <Image src={avatarPreview} alt="Slika" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImagePlus className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm p-2">
              <ImagePlus className="h-8 w-8 mx-auto mb-1" />
              Dodaj sliku
            </div>
          )}
        </label>
      </div>
    );
  }

  // ── Dropzone variant (default) ──
  return (
    <div className={className}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleInputChange}
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 opacity-0 pointer-events-none"
      />

      {/* Drag & drop zona */}
      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
        }`}
      >
        <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          Povucite slike ovdje ili kliknite za odabir
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WebP — max 5MB — do {maxFiles} slika
        </p>
      </label>

      {/* Preview uploadanih slika */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {files.map((f) => (
            <div key={f.id} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <Image
                src={f.previewUrl}
                alt={f.file.name}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Progress overlay */}
              {f.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
                  <div className="w-3/4 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(f.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Done checkmark */}
              {f.status === 'done' && (
                <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="absolute top-2 left-2 h-6 w-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>

              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                {f.file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

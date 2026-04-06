'use client';

import { useState } from 'react';
import { Plus, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/shared/image-upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GalleryUploadProps {
  sitterId: string;
  currentImages: string[];
  onImagesUpdated?: (newImages: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function GalleryUpload({ 
  sitterId, 
  currentImages = [], 
  onImagesUpdated,
  maxImages = 20,
  className = '' 
}: GalleryUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUploadComplete = async (urls: string[]) => {
    setIsUploading(true);
    
    try {
      // Combine existing images with new ones
      const allImages = [...currentImages, ...urls];
      
      // Update in database (this would be an API call in a real app)
      // For now, we'll simulate it
      console.log('Updating gallery with images:', allImages);
      
      // Call the callback if provided
      if (onImagesUpdated) {
        onImagesUpdated(allImages);
      }
      
      setUploadedUrls([]);
      setIsDialogOpen(false);
      
      toast.success('Images uploaded successfully!', {
        description: `${urls.length} image(s) added to your gallery.`,
      });
    } catch (error) {
      console.error('Error updating gallery:', error);
      toast.error('Failed to update gallery', {
        description: 'Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Remove from current images
      const updatedImages = currentImages.filter((_, i) => i !== index);
      
      // Update in database (this would be an API call in a real app)
      console.log('Removing image:', imageUrl);
      
      // Call the callback if provided
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages);
      }
      
      toast.success('Image removed from gallery');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const remainingSlots = maxImages - currentImages.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gallery</h3>
          <p className="text-sm text-gray-500">
            {currentImages.length} of {maxImages} photos • {remainingSlots} slots remaining
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={remainingSlots <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Photos to Gallery</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <ImageUpload
                  onUploadComplete={handleUploadComplete}
                  maxFiles={Math.min(remainingSlots, 10)}
                  variant="dropzone"
                  bucket="generic"
                  entityId={sitterId}
                />
                
                {remainingSlots <= 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-amber-800">Gallery full</p>
                        <p className="text-xs text-amber-700 mt-1">
                          You've reached the maximum of {maxImages} photos. Remove some images to add new ones.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-left space-y-1">
                  <p>• Upload high-quality photos of your space, pets, or services</p>
                  <p>• Supported formats: JPG, PNG, WebP</p>
                  <p>• Maximum file size: 5MB per image</p>
                  <p>• Recommended aspect ratio: 4:3 or 16:9</p>
                </div>
              </div>
              
              {uploadedUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded ({uploadedUrls.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <img 
                          src={url} 
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUploadComplete(uploadedUrls)}
                disabled={uploadedUrls.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save {uploadedUrls.length} Photo{uploadedUrls.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current gallery with remove option */}
      {currentImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveImage(imageUrl, index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Image number */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
              
              {/* Reorder handles (would be implemented in a real app) */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg pointer-events-none transition-colors" />
            </div>
          ))}
          
          {/* Add more button */}
          {remainingSlots > 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center bg-gray-50">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Add more</span>
                  <span className="text-xs text-gray-500">{remainingSlots} left</span>
                </button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">No photos yet</h4>
          <p className="text-gray-500 mb-4">Add photos to show pet owners your space and services</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Photos
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}

      {/* Gallery tips */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Gallery Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Include photos of your living space where pets will stay</li>
          <li>• Show photos of pets you've cared for (with owner permission)</li>
          <li>• Add before/after photos of grooming or special services</li>
          <li>• Include photos of nearby parks or walking routes</li>
          <li>• Use natural lighting for best results</li>
        </ul>
      </div>
    </div>
  );
}
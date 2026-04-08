import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Array<Record<string, unknown>>;
  eager?: Array<Record<string, unknown>>;
  tags?: string[];
  context?: Record<string, string>;
}

// Cloudinary error type
interface CloudinaryError {
  message: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = 'petpark/uploads',
    publicId,
    transformation,
    eager,
    tags,
    context,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    if (eager) {
      uploadOptions.eager = eager;
    }

    if (tags) {
      uploadOptions.tags = tags;
    }

    if (context) {
      uploadOptions.context = context;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: CloudinaryError | undefined, result: CloudinaryUploadResult | undefined) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload returned no result'));
        }
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      // Handle base64 data URI
      const base64Data = file.split(',')[1];
      uploadStream.end(Buffer.from(base64Data, 'base64'));
    } else {
      uploadStream.end(Buffer.from(file));
    }
  });
}

/**
 * Upload an image from a URL to Cloudinary
 * @param imageUrl - Source image URL
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = 'petpark/uploads',
    publicId,
    transformation,
    tags,
  } = options;

  const uploadOptions: Record<string, unknown> = {
    folder,
    resource_type: 'image',
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  if (transformation) {
    uploadOptions.transformation = transformation;
  }

  if (tags) {
    uploadOptions.tags = tags;
  }

  const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
  return result as CloudinaryUploadResult;
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image
 * @returns Success status
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    return false;
  }
}

/**
 * Generate an optimized image URL
 * @param publicId - Public ID of the image
 * @param options - Transformation options
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformation: string[] = [];

  if (width) transformation.push(`w_${width}`);
  if (height) transformation.push(`h_${height}`);
  if (crop) transformation.push(`c_${crop}`);
  if (quality) transformation.push(`q_${quality}`);
  if (format) transformation.push(`f_${format}`);

  const transformationString = transformation.join(',');
  
  return cloudinary.url(publicId, {
    transformation: [transformationString],
    secure: true,
  });
}

/**
 * Generate a placeholder/blur image URL
 * @param publicId - Public ID of the image
 * @returns Low-quality placeholder URL
 */
export function getPlaceholderUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: ['w_50,e_blur:1000,q_auto:low'],
    secure: true,
  });
}

/**
 * Get the Cloudinary instance for advanced usage
 */
export { cloudinary };

// Default export for convenience
export default {
  upload: uploadToCloudinary,
  uploadFromUrl: uploadImageFromUrl,
  delete: deleteFromCloudinary,
  getOptimizedUrl: getOptimizedImageUrl,
  getPlaceholderUrl,
  cloudinary,
};

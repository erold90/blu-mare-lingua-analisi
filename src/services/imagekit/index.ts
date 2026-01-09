/**
 * ImageKit Service - Free tier with unlimited transformations
 *
 * Features:
 * - 20 GB storage (free)
 * - 20 GB bandwidth/month (free)
 * - Unlimited image transformations
 * - Automatic WebP conversion
 * - Global CDN (450+ nodes)
 */

// ImageKit configuration - will be loaded from environment
const IMAGEKIT_CONFIG = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
  // Private key is only used server-side for uploads
};

export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  crop?: 'at_max' | 'at_least' | 'maintain_ratio' | 'force' | 'pad_resize';
  focus?: 'auto' | 'face' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  grayscale?: boolean;
}

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
}

class ImageKitService {
  private urlEndpoint: string;
  private publicKey: string;
  private isConfigured: boolean;

  constructor() {
    this.urlEndpoint = IMAGEKIT_CONFIG.urlEndpoint;
    this.publicKey = IMAGEKIT_CONFIG.publicKey;
    this.isConfigured = !!(this.urlEndpoint && this.publicKey);

    if (!this.isConfigured) {
      console.warn('ImageKit not configured. Set VITE_IMAGEKIT_PUBLIC_KEY and VITE_IMAGEKIT_URL_ENDPOINT');
    }
  }

  /**
   * Check if ImageKit is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Get optimized image URL with transformations
   * This is the main method for displaying images with automatic optimization
   */
  getImageUrl(filePath: string, options?: ImageKitTransformOptions): string {
    if (!this.isConfigured) {
      // Fallback to original path if ImageKit not configured
      return filePath;
    }

    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      crop = 'at_max',
      focus = 'auto',
      blur,
      grayscale
    } = options || {};

    // Build transformation string
    const transforms: string[] = [];

    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (quality) transforms.push(`q-${quality}`);
    if (format && format !== 'auto') transforms.push(`f-${format}`);
    if (crop) transforms.push(`c-${crop}`);
    if (focus) transforms.push(`fo-${focus}`);
    if (blur) transforms.push(`bl-${blur}`);
    if (grayscale) transforms.push(`e-grayscale`);

    // Always add auto format for best compression
    if (format === 'auto') {
      transforms.push('f-auto');
    }

    const transformString = transforms.length > 0 ? `tr:${transforms.join(',')}` : '';

    // Construct full URL
    const baseUrl = this.urlEndpoint.replace(/\/$/, '');
    const cleanPath = filePath.replace(/^\//, '');

    if (transformString) {
      return `${baseUrl}/${transformString}/${cleanPath}`;
    }

    return `${baseUrl}/${cleanPath}`;
  }

  /**
   * Get responsive srcSet for different screen sizes
   */
  getResponsiveSrcSet(
    filePath: string,
    sizes: number[] = [400, 800, 1200, 1600],
    options?: Omit<ImageKitTransformOptions, 'width'>
  ): string {
    return sizes
      .map(width => `${this.getImageUrl(filePath, { ...options, width })} ${width}w`)
      .join(', ');
  }

  /**
   * Get thumbnail URL (small, optimized for lists/grids)
   */
  getThumbnailUrl(filePath: string, size: number = 300): string {
    return this.getImageUrl(filePath, {
      width: size,
      height: size,
      crop: 'at_max',
      quality: 70,
      format: 'auto'
    });
  }

  /**
   * Get hero/banner URL (large, high quality)
   */
  getHeroUrl(filePath: string): string {
    return this.getImageUrl(filePath, {
      width: 1920,
      quality: 85,
      format: 'auto'
    });
  }

  /**
   * Get gallery image URL (medium size, good quality)
   */
  getGalleryUrl(filePath: string): string {
    return this.getImageUrl(filePath, {
      width: 800,
      quality: 80,
      format: 'auto'
    });
  }

  /**
   * Get blurred placeholder URL for lazy loading
   */
  getPlaceholderUrl(filePath: string): string {
    return this.getImageUrl(filePath, {
      width: 20,
      quality: 10,
      blur: 10
    });
  }

  /**
   * Upload image to ImageKit via backend API
   * Note: This requires a backend endpoint to handle the private key
   */
  async uploadImage(
    file: File,
    folder: string = 'villa-mareblu',
    fileName?: string
  ): Promise<ImageKitUploadResponse | null> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName || file.name);
      formData.append('folder', folder);

      // Call our backend upload endpoint
      const response = await fetch('/api/imagekit/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data as ImageKitUploadResponse;
    } catch (error) {
      console.error('ImageKit upload error:', error);
      return null;
    }
  }

  /**
   * Get authentication parameters for client-side upload
   * Requires backend endpoint to generate signature
   */
  async getUploadAuthParams(): Promise<{
    token: string;
    expire: number;
    signature: string;
  } | null> {
    try {
      const response = await fetch('/api/imagekit/auth');
      if (!response.ok) {
        throw new Error('Failed to get auth params');
      }
      return await response.json();
    } catch (error) {
      console.error('ImageKit auth error:', error);
      return null;
    }
  }

  /**
   * Delete image from ImageKit
   * Requires backend endpoint
   */
  async deleteImage(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/imagekit/delete/${fileId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('ImageKit delete error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const imagekitService = new ImageKitService();

// Export types
export type { ImageKitTransformOptions, ImageKitUploadResponse };


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadImageData, ImageRecord } from "./types";

// ImageKit configuration
const IMAGEKIT_CONFIG = {
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
};

// Check if ImageKit is configured
const isImageKitConfigured = () => !!(IMAGEKIT_CONFIG.urlEndpoint && IMAGEKIT_CONFIG.publicKey);

export class ImageStorageService {
  /**
   * Test basic Supabase connection
   */
  private async testSupabaseConnection(): Promise<void> {
    try {
      const { data, error } = await supabase.from('images').select('count').limit(1);
      if (error) {
        throw new Error(`Connessione Supabase fallita: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload image to ImageKit via Supabase Edge Function
   */
  private async uploadToImageKit(file: File, folder: string): Promise<{ path: string; url: string } | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('folder', `/${folder}`);

      // Get the Supabase URL for the Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/imagekit-upload/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'ImageKit upload failed');
      }

      const result = await response.json();

      return {
        path: `imagekit:${result.filePath}`, // Prefix to identify ImageKit paths
        url: result.url
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      return null;
    }
  }

  /**
   * Upload to Supabase Storage (fallback)
   */
  private async uploadToSupabase(filePath: string, file: File): Promise<any> {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('villa-images')
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Errore upload: ${uploadError.message}`);
    }

    return uploadData;
  }

  /**
   * Upload an image - tries ImageKit first, falls back to Supabase
   */
  async uploadImage(data: UploadImageData): Promise<ImageRecord | null> {
    try {
      const { category, apartment_id, file, alt_text, is_cover = false, display_order = 0 } = data;

      // Test Supabase connection first (for database)
      await this.testSupabaseConnection();

      // Optimize image before upload
      const optimizedFile = await this.optimizeImageForUpload(file);

      let uploadedPath: string;

      // Try ImageKit first if configured
      if (isImageKitConfigured()) {
        const folder = apartment_id ? `villa-mareblu/${category}/${apartment_id}` : `villa-mareblu/${category}`;
        const imagekitResult = await this.uploadToImageKit(optimizedFile, folder);

        if (imagekitResult) {
          uploadedPath = imagekitResult.path;
        } else {
          // Fallback to Supabase Storage
          console.warn('ImageKit upload failed, falling back to Supabase Storage');
          uploadedPath = await this.uploadToSupabaseStorage(optimizedFile, category, apartment_id);
        }
      } else {
        // Use Supabase Storage
        uploadedPath = await this.uploadToSupabaseStorage(optimizedFile, category, apartment_id);
      }

      // Create database record
      const insertData = {
        category,
        apartment_id: apartment_id || null,
        file_path: uploadedPath,
        file_name: file.name,
        display_order,
        is_cover,
        alt_text: alt_text || null
      };

      const { data: imageRecord, error: dbError } = await supabase
        .from('images')
        .insert(insertData)
        .select()
        .single();

      if (dbError) {
        // Try to clean up uploaded file on database error
        if (!uploadedPath.startsWith('imagekit:')) {
          await supabase.storage.from('villa-images').remove([uploadedPath]);
        }
        throw new Error(`Errore database: ${dbError.message}`);
      }

      return imageRecord as ImageRecord;

    } catch (error: any) {
      let errorMessage = "Errore nel caricamento dell'immagine";

      if (error.message?.includes('row-level security')) {
        errorMessage = "Errore: Politiche di sicurezza non configurate. Contatta l'amministratore.";
      } else if (error.message?.includes('bucket') || error.message?.includes('Bucket')) {
        errorMessage = "Errore: Bucket di storage non trovato o non accessibile.";
      } else if (error.message?.includes('already exists')) {
        errorMessage = "Errore: File con lo stesso nome già esistente. Riprova.";
      } else if (error.message) {
        errorMessage = `Errore: ${error.message}`;
      }

      toast.error(errorMessage);
      return null;
    }
  }

  /**
   * Upload to Supabase Storage with unique filename
   */
  private async uploadToSupabaseStorage(file: File, category: string, apartment_id?: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${category}_${apartment_id || 'general'}_${timestamp}_${randomId}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    const uploadData = await this.uploadToSupabase(filePath, file);
    return uploadData.path;
  }

  /**
   * Delete an image
   */
  async deleteImage(id: string, filePath: string): Promise<boolean> {
    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      // Delete from storage (only for Supabase paths)
      if (!filePath.startsWith('imagekit:')) {
        const { error: storageError } = await supabase.storage
          .from('villa-images')
          .remove([filePath]);

        if (storageError) {
          console.warn('Storage deletion failed:', storageError);
        }
      } else {
        // For ImageKit, we'd need to call the delete endpoint
        // For now, we'll skip this as ImageKit keeps files
        console.log('ImageKit file deletion skipped (manual cleanup may be needed)');
      }

      toast.success("Immagine eliminata");
      return true;
    } catch (error) {
      toast.error("Errore nell'eliminazione dell'immagine");
      return false;
    }
  }

  /**
   * Get public URL for an image - handles both Supabase and ImageKit
   */
  getImageUrl(filePath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }): string {
    // Handle ImageKit paths
    if (filePath.startsWith('imagekit:')) {
      return this.getImageKitUrl(filePath.replace('imagekit:', ''), options);
    }

    // Handle Supabase paths
    const { data } = supabase.storage
      .from('villa-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Get ImageKit URL with transformations
   */
  private getImageKitUrl(path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }): string {
    if (!IMAGEKIT_CONFIG.urlEndpoint) {
      console.warn('ImageKit URL endpoint not configured');
      return path;
    }

    const { width, height, quality = 80, format = 'auto' } = options || {};

    // Build transformation string
    const transforms: string[] = [];

    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (quality) transforms.push(`q-${quality}`);
    if (format === 'auto') transforms.push('f-auto');
    else if (format) transforms.push(`f-${format}`);

    // Add crop mode for better quality
    transforms.push('c-at_max');

    const transformString = transforms.length > 0 ? `tr:${transforms.join(',')}` : '';

    // Construct full URL
    const baseUrl = IMAGEKIT_CONFIG.urlEndpoint.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');

    if (transformString) {
      return `${baseUrl}/${transformString}/${cleanPath}`;
    }

    return `${baseUrl}/${cleanPath}`;
  }

  /**
   * Get optimized image URL - applies transformations for ImageKit images
   */
  getOptimizedImageUrl(filePath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): string {
    // For ImageKit images, apply transformations
    if (filePath.startsWith('imagekit:')) {
      return this.getImageUrl(filePath, {
        ...options,
        format: 'auto'
      });
    }

    // For Supabase images, just return the public URL
    // (transformations require Pro plan)
    return this.getImageUrl(filePath);
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(filePath: string, size: number = 300): string {
    return this.getImageUrl(filePath, {
      width: size,
      height: size,
      quality: 70,
      format: 'auto'
    });
  }

  /**
   * Get hero image URL (large, high quality)
   */
  getHeroUrl(filePath: string): string {
    return this.getImageUrl(filePath, {
      width: 1920,
      quality: 85,
      format: 'auto'
    });
  }

  /**
   * Get gallery image URL
   */
  getGalleryUrl(filePath: string): string {
    return this.getImageUrl(filePath, {
      width: 800,
      quality: 80,
      format: 'auto'
    });
  }

  /**
   * Generate srcSet for responsive images
   */
  getResponsiveSrcSet(filePath: string, sizes: number[] = [400, 800, 1200]): string {
    return sizes
      .map(width => `${this.getImageUrl(filePath, { width })} ${width}w`)
      .join(', ');
  }

  /**
   * Optimize image before upload (resize and compress)
   */
  async optimizeImageForUpload(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      // Skip optimization for small files (< 500KB) or non-image files
      if (file.size < 500 * 1024 || !file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // If image is already smaller than maxWidth, just compress
        const needsResize = img.width > maxWidth;
        const canvas = document.createElement('canvas');

        if (needsResize) {
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = Math.round(img.height * ratio);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob with compression
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          blob => {
            if (blob) {
              const optimizedFile = new File(
                [blob],
                file.name,
                { type: outputType, lastModified: Date.now() }
              );
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // Return original on error
      };

      img.src = url;
    });
  }
}

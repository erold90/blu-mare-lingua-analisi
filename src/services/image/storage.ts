
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadImageData, ImageRecord } from "./types";

export class ImageStorageService {
  /**
   * Test basic Supabase connection
   */
  private async testSupabaseConnection(): Promise<void> {
    
    try {
      // Test basic connection with a simple query
      const { data, error } = await supabase.from('images').select('count').limit(1);
      
      if (error) {
        throw new Error(`Connessione Supabase fallita: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Attempt direct upload without checking bucket existence
   */
  private async attemptDirectUpload(filePath: string, file: File): Promise<any> {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('villa-images')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 year cache - images are immutable
          upsert: false
        });


      if (uploadError) {
        throw new Error(`Errore upload diretto: ${uploadError.message}`);
      }

      return uploadData;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload an image to Supabase storage and create database record
   */
  async uploadImage(data: UploadImageData): Promise<ImageRecord | null> {
    try {
      const { category, apartment_id, file, alt_text, is_cover = false, display_order = 0 } = data;

      // Test Supabase connection first
      await this.testSupabaseConnection();

      // Optimize image before upload (resize and compress)
      const optimizedFile = await this.optimizeImageForUpload(file);

      // Generate unique file path with random component to avoid conflicts
      const fileExt = optimizedFile.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${category}_${apartment_id || 'general'}_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `${category}/${fileName}`;

      // Try direct upload without checking bucket existence
      const uploadData = await this.attemptDirectUpload(filePath, optimizedFile);
      
      // Create database record
      const insertData = {
        category,
        apartment_id: apartment_id || null,
        file_path: uploadData.path,
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
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('villa-images').remove([uploadData.path]);
        throw new Error(`Errore database: ${dbError.message}`);
      }
      
      
      return imageRecord as ImageRecord;
      
    } catch (error) {
      
      // Provide more specific error messages
      let errorMessage = "Errore nel caricamento dell'immagine";
      
      if (error.message?.includes('row-level security')) {
        errorMessage = "Errore: Politiche di sicurezza non configurate. Contatta l'amministratore.";
      } else if (error.message?.includes('bucket') || error.message?.includes('Bucket')) {
        errorMessage = "Errore: Bucket di storage non trovato o non accessibile. Verifica la configurazione Supabase.";
      } else if (error.message?.includes('already exists')) {
        errorMessage = "Errore: File con lo stesso nome già esistente. Riprova.";
      } else if (error.message?.includes('does not exist')) {
        errorMessage = "Errore: Il bucket villa-images non esiste o non è accessibile.";
      } else if (error.message?.includes('permission')) {
        errorMessage = "Errore: Permessi insufficienti per accedere al storage.";
      } else if (error.message) {
        errorMessage = `Errore: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return null;
    }
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
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('villa-images')
        .remove([filePath]);
        
      if (storageError) {
        // Don't throw here as the database record is already deleted
      }
      
      toast.success("Immagine eliminata");
      return true;
    } catch (error) {
      toast.error("Errore nell'eliminazione dell'immagine");
      return false;
    }
  }

  /**
   * Get public URL for an image
   */
  getImageUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('villa-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Cache for checking if transformations are available
  private static transformationsAvailable: boolean | null = null;

  /**
   * Check if Supabase image transformations are available (Pro plan required)
   */
  private async checkTransformationsAvailable(): Promise<boolean> {
    if (ImageStorageService.transformationsAvailable !== null) {
      return ImageStorageService.transformationsAvailable;
    }

    try {
      // Try to fetch a small transformed image to test
      const testUrl = this.getImageUrl('test') + '?width=10';
      const response = await fetch(testUrl, { method: 'HEAD' });
      // If we get 400 or specific error, transformations are not available
      ImageStorageService.transformationsAvailable = response.status !== 400;
    } catch {
      ImageStorageService.transformationsAvailable = false;
    }

    return ImageStorageService.transformationsAvailable;
  }

  /**
   * Get optimized image URL with Supabase transformations
   * Falls back to original image if transformations are not available (Free tier)
   * Supports resize, quality adjustment, and WebP conversion on Pro plan
   */
  getOptimizedImageUrl(
    filePath: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'origin';
    }
  ): string {
    const { width, height, quality = 80, format = 'webp' } = options || {};

    // Build transform options
    const transform: Record<string, any> = {
      quality,
      format
    };

    if (width) transform.width = width;
    if (height) transform.height = height;

    try {
      const { data } = supabase.storage
        .from('villa-images')
        .getPublicUrl(filePath, { transform });

      return data.publicUrl;
    } catch {
      // Fallback to original image if transformations fail
      return this.getImageUrl(filePath);
    }
  }

  /**
   * Get image URL with fallback - tries optimized first, falls back to original
   * Use this for critical images that must always load
   */
  getImageUrlWithFallback(
    filePath: string,
    options?: { width?: number; quality?: number }
  ): { optimized: string; fallback: string } {
    return {
      optimized: this.getOptimizedImageUrl(filePath, options),
      fallback: this.getImageUrl(filePath)
    };
  }

  /**
   * Generate srcSet for responsive images
   */
  getResponsiveSrcSet(filePath: string, sizes: number[] = [400, 800, 1200]): string {
    return sizes
      .map(width => `${this.getOptimizedImageUrl(filePath, { width })} ${width}w`)
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

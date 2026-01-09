
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
          cacheControl: '3600',
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
      
      // Generate unique file path with random component to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${category}_${apartment_id || 'general'}_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `${category}/${fileName}`;
      
      
      // Try direct upload without checking bucket existence
      const uploadData = await this.attemptDirectUpload(filePath, file);
      
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
}

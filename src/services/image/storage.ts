
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadImageData, ImageRecord } from "./types";

export class ImageStorageService {
  /**
   * Upload an image to Supabase storage and create database record
   */
  async uploadImage(data: UploadImageData): Promise<ImageRecord | null> {
    try {
      const { category, apartment_id, file, alt_text, is_cover = false, display_order = 0 } = data;
      
      console.log("Starting image upload:", {
        category,
        apartment_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        is_cover
      });
      
      // Generate unique file path with random component to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${category}_${apartment_id || 'general'}_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `${category}/${fileName}`;
      
      console.log("Generated file path:", filePath);
      
      // Check if bucket exists and is accessible
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets?.map(b => b.name), "Error:", bucketsError);
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('villa-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("File uploaded successfully:", uploadData);
      
      // Create database record
      const { data: imageRecord, error: dbError } = await supabase
        .from('images')
        .insert({
          category,
          apartment_id: apartment_id || null,
          file_path: uploadData.path,
          file_name: file.name,
          display_order,
          is_cover,
          alt_text: alt_text || null
        })
        .select()
        .single();
        
      if (dbError) {
        console.error("Database insert error:", dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('villa-images').remove([uploadData.path]);
        throw dbError;
      }
      
      console.log("Database record created:", imageRecord);
      toast.success("Immagine caricata con successo");
      return imageRecord as ImageRecord;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('row-level security')) {
        toast.error("Errore: Politiche di sicurezza non configurate. Contatta l'amministratore.");
      } else if (error.message?.includes('bucket')) {
        toast.error("Errore: Bucket di storage non trovato o non accessibile.");
      } else if (error.message?.includes('already exists')) {
        toast.error("Errore: File con lo stesso nome già esistente. Riprova.");
      } else {
        toast.error("Errore nel caricamento dell'immagine: " + (error.message || "Errore sconosciuto"));
      }
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
        console.error('Error deleting file from storage:', storageError);
        // Don't throw here as the database record is already deleted
      }
      
      toast.success("Immagine eliminata");
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
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

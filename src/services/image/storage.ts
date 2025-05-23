
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadImageData, ImageRecord } from "./types";

export class ImageStorageService {
  /**
   * Check if bucket exists with retry mechanism
   */
  private async checkBucketExists(retries = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      console.log(`🔍 Attempt ${i + 1}/${retries} - Checking if villa-images bucket exists...`);
      
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        console.log("📋 Raw buckets response:", { buckets, error: bucketsError });
        
        if (bucketsError) {
          console.error(`❌ Bucket check error (attempt ${i + 1}):`, bucketsError);
          if (i === retries - 1) return false;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
          continue;
        }
        
        if (!buckets) {
          console.warn(`⚠️ No buckets returned (attempt ${i + 1})`);
          if (i === retries - 1) return false;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        console.log("📊 Available buckets:", buckets.map(b => ({ 
          name: b.name, 
          id: b.id, 
          public: b.public,
          created_at: b.created_at 
        })));
        
        const villaBucket = buckets.find(b => b.id === 'villa-images' || b.name === 'villa-images');
        
        if (villaBucket) {
          console.log("✅ villa-images bucket found:", villaBucket);
          return true;
        } else {
          console.warn(`⚠️ villa-images bucket not found in ${buckets.length} buckets (attempt ${i + 1})`);
          if (i < retries - 1) {
            console.log(`🔄 Retrying in ${(i + 1)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      } catch (error) {
        console.error(`💥 Exception during bucket check (attempt ${i + 1}):`, error);
        if (i === retries - 1) return false;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    return false;
  }

  /**
   * Upload an image to Supabase storage and create database record
   */
  async uploadImage(data: UploadImageData): Promise<ImageRecord | null> {
    try {
      const { category, apartment_id, file, alt_text, is_cover = false, display_order = 0 } = data;
      
      console.log("=== STARTING IMAGE UPLOAD ===");
      console.log("Upload data:", {
        category,
        apartment_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        is_cover,
        display_order
      });
      
      // Generate unique file path with random component to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${category}_${apartment_id || 'general'}_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `${category}/${fileName}`;
      
      console.log("Generated file path:", filePath);
      
      // Check if bucket exists with retry mechanism
      console.log("🔍 Checking bucket access with retry mechanism...");
      const bucketExists = await this.checkBucketExists(3);
      
      if (!bucketExists) {
        console.error("❌ villa-images bucket not found after multiple attempts");
        throw new Error("Bucket 'villa-images' non trovato. Controlla la configurazione Supabase.");
      }
      
      console.log("✅ Bucket verification successful, proceeding with upload...");
      
      // Upload file to storage
      console.log("📤 Starting file upload to storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('villa-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError);
        throw new Error(`Errore upload storage: ${uploadError.message}`);
      }
      
      console.log("✅ File uploaded successfully:", uploadData);
      
      // Create database record
      console.log("💾 Creating database record...");
      const insertData = {
        category,
        apartment_id: apartment_id || null,
        file_path: uploadData.path,
        file_name: file.name,
        display_order,
        is_cover,
        alt_text: alt_text || null
      };
      
      console.log("Insert data:", insertData);
      
      const { data: imageRecord, error: dbError } = await supabase
        .from('images')
        .insert(insertData)
        .select()
        .single();
        
      if (dbError) {
        console.error("❌ Database insert error:", dbError);
        // Clean up uploaded file if database insert fails
        console.log("🧹 Cleaning up uploaded file due to DB error...");
        await supabase.storage.from('villa-images').remove([uploadData.path]);
        throw new Error(`Errore database: ${dbError.message}`);
      }
      
      console.log("✅ Database record created successfully:", imageRecord);
      console.log("=== UPLOAD COMPLETED SUCCESSFULLY ===");
      
      return imageRecord as ImageRecord;
    } catch (error) {
      console.error('=== UPLOAD FAILED ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      let errorMessage = "Errore nel caricamento dell'immagine";
      
      if (error.message?.includes('row-level security')) {
        errorMessage = "Errore: Politiche di sicurezza non configurate. Contatta l'amministratore.";
      } else if (error.message?.includes('bucket')) {
        errorMessage = "Errore: Bucket di storage non trovato o non accessibile. Verifica la configurazione Supabase.";
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

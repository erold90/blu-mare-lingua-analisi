
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageCategory, ImageRecord } from "./types";

export class ImageDatabaseService {
  /**
   * Get images by category
   */
  async getImagesByCategory(category: ImageCategory, apartmentId?: string): Promise<ImageRecord[]> {
    try {
      let query = supabase
        .from('images')
        .select('*')
        .eq('category', category)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
        
      if (apartmentId) {
        query = query.eq('apartment_id', apartmentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return (data || []) as ImageRecord[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Update image metadata
   */
  async updateImage(id: string, updates: Partial<ImageRecord>): Promise<ImageRecord | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Immagine aggiornata");
      return data as ImageRecord;
    } catch (error) {
      toast.error("Errore nell'aggiornamento dell'immagine");
      return null;
    }
  }

  /**
   * Set cover image for apartment
   */
  async setCoverImage(apartmentId: string, imageId: string): Promise<boolean> {
    try {
      // First, remove cover status from all apartment images
      await supabase
        .from('images')
        .update({ is_cover: false })
        .eq('apartment_id', apartmentId)
        .eq('category', 'apartment');
        
      // Then set the new cover image
      const { error } = await supabase
        .from('images')
        .update({ is_cover: true })
        .eq('id', imageId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Immagine di copertina impostata");
      return true;
    } catch (error) {
      toast.error("Errore nell'impostare l'immagine di copertina");
      return false;
    }
  }

  /**
   * Reorder images
   */
  async reorderImages(imageUpdates: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      
      // Update each image's display_order individually to ensure they all succeed
      const updatePromises = imageUpdates.map(async (update) => {
        
        const { error } = await supabase
          .from('images')
          .update({ 
            display_order: update.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);
          
        if (error) {
          throw error;
        }
        
        return true;
      });
      
      await Promise.all(updatePromises);
      
      toast.success("Ordine immagini aggiornato");
      return true;
    } catch (error) {
      toast.error("Errore nel riordinare le immagini");
      return false;
    }
  }

  /**
   * Get cover image for apartment
   */
  async getCoverImage(apartmentId: string): Promise<ImageRecord | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('apartment_id', apartmentId)
        .eq('category', 'apartment')
        .eq('is_cover', true)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data as ImageRecord || null;
    } catch (error) {
      return null;
    }
  }
}

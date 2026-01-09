
import { supabase } from "@/integrations/supabase/client";
import { ImageRecord } from "@/services/imageService";

/**
 * Supabase image service for apartment images
 */
class SupabaseImageService {
  /**
   * Get apartment images from Supabase
   */
  async getApartmentImages(apartmentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('category', 'apartment')
        .eq('apartment_id', apartmentId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Convert Supabase image records to URLs
      const imageUrls = data.map(image => {
        const { data: urlData } = supabase.storage
          .from('villa-images')
          .getPublicUrl(image.file_path);
        
        return urlData.publicUrl;
      });

      return imageUrls;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get cover image for apartment
   */
  async getCoverImage(apartmentId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('category', 'apartment')
        .eq('apartment_id', apartmentId)
        .eq('is_cover', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        return null;
      }

      if (!data) {
        // Fallback to first image if no cover is set
        const images = await this.getApartmentImages(apartmentId);
        return images.length > 0 ? images[0] : null;
      }

      const { data: urlData } = supabase.storage
        .from('villa-images')
        .getPublicUrl(data.file_path);

      return urlData.publicUrl;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if apartment has images in Supabase
   */
  async hasImages(apartmentId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'apartment')
        .eq('apartment_id', apartmentId);

      if (error) {
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      return false;
    }
  }
}

export const supabaseImageService = new SupabaseImageService();

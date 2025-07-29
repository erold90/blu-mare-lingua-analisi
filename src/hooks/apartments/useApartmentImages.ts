
import { useState, useEffect } from "react";
import { apartments } from "@/data/apartments";
import { imageService } from "@/services/image";

export const useApartmentImages = () => {
  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadApartmentImages = async () => {
    console.log("🏠 Loading apartment images from Supabase...");
    try {
      const imagesMap: { [key: string]: string[] } = {};
      
      for (const apartment of apartments) {
        try {
          // Get images from Supabase database
          const supabaseImages = await imageService.getImagesByCategory('apartment', apartment.id);
          
          if (supabaseImages && supabaseImages.length > 0) {
            // Find cover image first, then sort the rest by display_order
            const coverImage = supabaseImages.find(img => img.is_cover);
            const otherImages = supabaseImages
              .filter(img => !img.is_cover)
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            
            // Put cover image first, then the rest
            const orderedImages = coverImage ? [coverImage, ...otherImages] : otherImages;
            
            const imageUrls = orderedImages.map(img => imageService.getImageUrl(img.file_path));
            
            imagesMap[apartment.id] = imageUrls;
            console.log(`📸 Loaded ${imageUrls.length} images for ${apartment.name} from Supabase (cover: ${coverImage ? 'YES' : 'NO'})`);
          } else {
            console.log(`⚠️ No images found for ${apartment.name} in Supabase, using placeholder`);
            imagesMap[apartment.id] = ["/placeholder.svg"];
          }
        } catch (error) {
          console.error(`❌ Error loading images for ${apartment.name}:`, error);
          imagesMap[apartment.id] = ["/placeholder.svg"];
        }
      }
      
      setApartmentImages(imagesMap);
      console.log("✅ All apartment images loaded from Supabase:", imagesMap);
    } catch (error) {
      console.error("❌ Error loading apartment images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApartmentImages();

    // Listen for image updates
    const handleImageUpdate = () => {
      console.log("🔄 Images updated, reloading...");
      loadApartmentImages();
    };

    window.addEventListener('apartmentImagesUpdated', handleImageUpdate);
    
    return () => {
      window.removeEventListener('apartmentImagesUpdated', handleImageUpdate);
    };
  }, []);

  return { apartmentImages, isLoading, reloadImages: loadApartmentImages };
};


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
            // Convert to URLs and sort by display_order
            const imageUrls = supabaseImages
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map(img => imageService.getImageUrl(img.file_path));
            
            imagesMap[apartment.id] = imageUrls;
            console.log(`📸 Loaded ${imageUrls.length} images for ${apartment.name} from Supabase`);
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

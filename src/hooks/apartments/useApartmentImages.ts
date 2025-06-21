
import { useState, useEffect } from "react";
import { apartments } from "@/data/apartments";
import { imageService } from "@/utils/image";

export const useApartmentImages = () => {
  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApartmentImages = async () => {
      console.log("🏠 Loading apartment images...");
      try {
        const imagesMap: { [key: string]: string[] } = {};
        
        for (const apartment of apartments) {
          try {
            const images = await imageService.scanApartmentImages(apartment.id);
            console.log(`📸 Loaded ${images.length} images for ${apartment.name}:`, images);
            
            if (images && images.length > 0) {
              imagesMap[apartment.id] = images;
            } else {
              console.log(`⚠️ No images found for ${apartment.name}, using placeholder`);
              imagesMap[apartment.id] = ["/placeholder.svg"];
            }
          } catch (error) {
            console.error(`❌ Error loading images for ${apartment.name}:`, error);
            imagesMap[apartment.id] = ["/placeholder.svg"];
          }
        }
        
        setApartmentImages(imagesMap);
        console.log("✅ All apartment images loaded:", imagesMap);
      } catch (error) {
        console.error("❌ Error loading apartment images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApartmentImages();
  }, []);

  return { apartmentImages, isLoading };
};

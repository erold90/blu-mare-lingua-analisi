
import { useState, useEffect, useRef } from "react";
import { apartments } from "@/data/apartments";
import { imageService } from "@/services/image";

// Cache per evitare ricaricamenti
const imageCache: { [key: string]: string[] } = {};

export const useApartmentImages = () => {
  // Inizializza con placeholder per mostrare subito la pagina
  const getInitialImages = () => {
    const initial: { [key: string]: string[] } = {};
    apartments.forEach(apt => {
      initial[apt.id] = imageCache[apt.id] || ["/placeholder.svg"];
    });
    return initial;
  };

  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>(getInitialImages);
  const [isLoading, setIsLoading] = useState(false); // Non bloccare più il render
  const loadedRef = useRef(false);

  const loadApartmentImages = async () => {
    // Se già in cache, usa quella
    if (Object.keys(imageCache).length === apartments.length) {
      setApartmentImages({ ...imageCache });
      return;
    }

    setIsLoading(true);

    try {
      // Carica TUTTE le immagini in PARALLELO
      const imagePromises = apartments.map(async (apartment) => {
        try {
          const supabaseImages = await imageService.getImagesByCategory('apartment', apartment.id);

          if (supabaseImages && supabaseImages.length > 0) {
            const coverImage = supabaseImages.find(img => img.is_cover);
            const otherImages = supabaseImages
              .filter(img => !img.is_cover)
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

            const orderedImages = coverImage ? [coverImage, ...otherImages] : otherImages;
            const imageUrls = orderedImages.map(img => imageService.getGalleryUrl(img.file_path));

            return { id: apartment.id, images: imageUrls };
          }
          return { id: apartment.id, images: ["/placeholder.svg"] };
        } catch {
          return { id: apartment.id, images: ["/placeholder.svg"] };
        }
      });

      // Aspetta tutte le promesse in parallelo
      const results = await Promise.all(imagePromises);

      // Costruisci la mappa
      const imagesMap: { [key: string]: string[] } = {};
      results.forEach(result => {
        imagesMap[result.id] = result.images;
        imageCache[result.id] = result.images; // Salva in cache
      });

      setApartmentImages(imagesMap);
    } catch (error) {
      console.error('Error loading apartment images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Carica solo una volta
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadApartmentImages();
    }

    const handleImageUpdate = () => {
      // Svuota cache e ricarica
      Object.keys(imageCache).forEach(key => delete imageCache[key]);
      loadApartmentImages();
    };

    window.addEventListener('apartmentImagesUpdated', handleImageUpdate);

    return () => {
      window.removeEventListener('apartmentImagesUpdated', handleImageUpdate);
    };
  }, []);

  return { apartmentImages, isLoading, reloadImages: loadApartmentImages };
};

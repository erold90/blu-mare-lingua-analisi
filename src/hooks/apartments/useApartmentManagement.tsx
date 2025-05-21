
import { useState, useEffect } from "react";
import { apartments as apartmentsData, Apartment } from "@/data/apartments";
import { toast } from "sonner";

export const useApartmentManagement = () => {
  // Load apartments from localStorage or use default data
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const savedApartments = localStorage.getItem("apartments");
    if (savedApartments) {
      try {
        return JSON.parse(savedApartments);
      } catch (error) {
        console.error("Failed to parse saved apartments:", error);
        return apartmentsData;
      }
    }
    return apartmentsData;
  });
  
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>({});
  const [coverImage, setCoverImage] = useState<{ [key: string]: number }>({});

  // Load saved images and cover image indices from localStorage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      const savedImages = localStorage.getItem("apartmentImages");
      const savedCovers = localStorage.getItem("apartmentCovers");
      
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          setApartmentImages(parsedImages);
        } catch (error) {
          console.error("Failed to parse saved apartment images:", error);
        }
      }
      
      if (savedCovers) {
        try {
          const parsedCovers = JSON.parse(savedCovers);
          setCoverImage(parsedCovers);
        } catch (error) {
          console.error("Failed to parse saved cover image indices:", error);
        }
      }
    };

    loadImagesFromStorage();
  }, []);

  // Initialize selected apartment
  useEffect(() => {
    if (apartments.length > 0) {
      if (!selectedApartment) {
        setSelectedApartment(apartments[0]);
        setSelectedApartmentId(apartments[0].id);
      }
    }
  }, [apartments, selectedApartment]);
  
  // Save apartments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("apartments", JSON.stringify(apartments));
    
    // Update each apartment's images array with the cover image
    const updatedApartments = apartments.map(apt => {
      const images = apartmentImages[apt.id] || [];
      const coverIdx = coverImage[apt.id] ?? 0;
      
      return {
        ...apt,
        images: images.length > 0 ? [images[coverIdx !== -1 ? coverIdx : 0], ...images] : ["placeholder.svg"]
      };
    });
    
    localStorage.setItem("apartments", JSON.stringify(updatedApartments));
  }, [apartments, apartmentImages, coverImage]);
  
  // Save images and cover image indices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("apartmentImages", JSON.stringify(apartmentImages));
    localStorage.setItem("apartmentCovers", JSON.stringify(coverImage));
    
    // Also update the gallery images in localStorage for the GalleryPage
    const allImages: string[] = [];
    Object.values(apartmentImages).forEach(images => {
      allImages.push(...images);
    });
    
    localStorage.setItem("galleryImages", JSON.stringify(allImages));
    
    // Dispatch a custom event to notify other components that images have been updated
    const event = new CustomEvent("apartmentImagesUpdated");
    window.dispatchEvent(event);
  }, [apartmentImages, coverImage]);

  const updateApartmentImages = (apartmentId: string, images: string[]) => {
    setApartmentImages(prev => ({
      ...prev,
      [apartmentId]: images
    }));
  };

  const updateCoverImage = (apartmentId: string, index: number) => {
    setCoverImage(prev => ({
      ...prev,
      [apartmentId]: index
    }));
    
    // Update the apartment's main image in the apartments list
    if (apartmentImages[apartmentId] && apartmentImages[apartmentId][index]) {
      const coverImageUrl = apartmentImages[apartmentId][index];
      
      setApartments(prevApartments => 
        prevApartments.map(apt => 
          apt.id === apartmentId ? { ...apt, images: [coverImageUrl, ...apt.images] } : apt
        )
      );
    }
    
    toast.success("Immagine di copertina impostata");
  };

  const updateApartment = (updatedApartment: Apartment) => {
    const updatedApartments = apartments.map(apt => 
      apt.id === updatedApartment.id ? updatedApartment : apt
    );
    
    setApartments(updatedApartments);
    toast.success("Appartamento aggiornato");
  };

  return {
    apartments,
    selectedApartment,
    selectedApartmentId,
    setSelectedApartment,
    setSelectedApartmentId,
    apartmentImages,
    coverImage,
    updateApartmentImages,
    updateCoverImage,
    updateApartment
  };
};

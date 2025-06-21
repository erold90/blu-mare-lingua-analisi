
import { useState, useEffect, useRef } from "react";
import { apartments as apartmentsData, Apartment } from "@/data/apartments";
import { discoveryStorage, DISCOVERY_STORAGE_KEYS } from "@/services/discoveryStorage";

export const useApartmentManagement = () => {
  // Load apartments from discovery storage or use default data
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const savedApartments = discoveryStorage.getItem<Apartment[]>(DISCOVERY_STORAGE_KEYS.APARTMENTS);
    if (savedApartments) {
      try {
        return savedApartments;
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

  // Use refs to track if we're in the middle of an update to prevent loops
  const isUpdatingRef = useRef(false);
  const lastUpdateRef = useRef<string>('');

  // Load saved images and cover image indices from discovery storage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      if (isUpdatingRef.current) return; // Prevent loops
      
      const savedImages = discoveryStorage.getItem<{ [key: string]: string[] }>(DISCOVERY_STORAGE_KEYS.APARTMENT_IMAGES);
      const savedCovers = discoveryStorage.getItem<{ [key: string]: number }>(DISCOVERY_STORAGE_KEYS.APARTMENT_COVERS);
      
      if (savedImages) {
        try {
          setApartmentImages(prev => {
            const newImages = savedImages;
            if (JSON.stringify(prev) !== JSON.stringify(newImages)) {
              return newImages;
            }
            return prev;
          });
        } catch (error) {
          console.error("Failed to parse saved apartment images:", error);
        }
      }
      
      if (savedCovers) {
        try {
          setCoverImage(prev => {
            const newCovers = savedCovers;
            if (JSON.stringify(prev) !== JSON.stringify(newCovers)) {
              return newCovers;
            }
            return prev;
          });
        } catch (error) {
          console.error("Failed to parse saved cover image indices:", error);
        }
      }
    };

    loadImagesFromStorage();
    
    // Listen for storage updates from other tabs/windows
    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail?.key === DISCOVERY_STORAGE_KEYS.APARTMENT_IMAGES ||
        customEvent.detail?.key === DISCOVERY_STORAGE_KEYS.APARTMENT_COVERS ||
        customEvent.detail?.key === DISCOVERY_STORAGE_KEYS.APARTMENTS
      ) {
        loadImagesFromStorage();
        const updatedApartments = discoveryStorage.getItem<Apartment[]>(DISCOVERY_STORAGE_KEYS.APARTMENTS);
        if (updatedApartments) {
          setApartments(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(updatedApartments)) {
              return updatedApartments;
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener("discoveryStorageUpdate", handleStorageUpdate);
    
    return () => {
      window.removeEventListener("discoveryStorageUpdate", handleStorageUpdate);
    };
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
  
  // Save apartments to discovery storage whenever they change (with loop prevention)
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    // Update each apartment's images array with the cover image
    const updatedApartments = apartments.map(apt => {
      const images = apartmentImages[apt.id] || [];
      const coverIdx = coverImage[apt.id] ?? 0;
      
      return {
        ...apt,
        images: images.length > 0 ? [images[coverIdx !== -1 ? coverIdx : 0], ...images] : ["placeholder.svg"]
      };
    });
    
    const updateKey = JSON.stringify({ apartments, apartmentImages, coverImage });
    if (lastUpdateRef.current !== updateKey) {
      isUpdatingRef.current = true;
      lastUpdateRef.current = updateKey;
      
      try {
        discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.APARTMENTS, updatedApartments);
      } finally {
        // Reset the flag after a short delay to allow the update to complete
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    }
  }, [apartments, apartmentImages, coverImage]);
  
  // Save images and cover image indices to discovery storage whenever they change (with loop prevention)
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    try {
      discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.APARTMENT_IMAGES, apartmentImages);
      discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.APARTMENT_COVERS, coverImage);
      
      // Also update the gallery images in discovery storage for the GalleryPage
      const allImages: string[] = [];
      Object.values(apartmentImages).forEach(images => {
        allImages.push(...images);
      });
      
      discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.GALLERY_IMAGES, allImages);
      
      // Dispatch a custom event to notify other components that images have been updated
      const event = new CustomEvent("apartmentImagesUpdated");
      window.dispatchEvent(event);
    } finally {
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
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
  };

  const updateApartment = (updatedApartment: Apartment) => {
    const updatedApartments = apartments.map(apt => 
      apt.id === updatedApartment.id ? updatedApartment : apt
    );
    
    setApartments(updatedApartments);
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

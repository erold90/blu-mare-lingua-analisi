
import * as React from "react";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Gallery, Image } from "lucide-react";

const GalleryPage = () => {
  // Use state for images, initialize with fallback images
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ]);

  // Load all apartment images from localStorage
  useEffect(() => {
    const loadImagesFromStorage = () => {
      try {
        // Get apartment images directly
        const apartmentImagesStr = localStorage.getItem("apartmentImages");
        if (apartmentImagesStr) {
          const apartmentImages = JSON.parse(apartmentImagesStr);
          
          // Flatten all image arrays into a single array
          const allImages: string[] = [];
          Object.values(apartmentImages).forEach((imageArray: any) => {
            if (Array.isArray(imageArray) && imageArray.length > 0) {
              allImages.push(...imageArray);
            }
          });
          
          if (allImages.length > 0) {
            setImages(allImages);
            return;
          }
        }
        
        // If no apartment images or gallery images found, check if there are any gallery images saved
        const galleryImagesStr = localStorage.getItem("galleryImages");
        if (galleryImagesStr) {
          const galleryImages = JSON.parse(galleryImagesStr);
          if (Array.isArray(galleryImages) && galleryImages.length > 0) {
            setImages(galleryImages);
          }
        }
      } catch (error) {
        console.error("Error loading images from storage:", error);
      }
    };
    
    loadImagesFromStorage();
    
    // Set up an event listener for custom storage events
    const handleStorageChange = (e: Event) => {
      if (e instanceof StorageEvent && (e.key === "apartmentImages" || e.key === "galleryImages")) {
        loadImagesFromStorage();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also set up a custom event listener for local changes (same window)
    window.addEventListener("apartmentImagesUpdated", loadImagesFromStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apartmentImagesUpdated", loadImagesFromStorage);
    };
  }, []);

  const categories = [
    "Tutte", "Interni", "Esterni", "Vista Mare", "Piscina"
  ];

  const [selectedCategory, setSelectedCategory] = useState("Tutte");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Galleria</h1>
      
      {/* Categorie filtro */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === category 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary hover:bg-secondary/80"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Griglia immagini */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
              onClick={() => setSelectedImage(image)}
            >
              <AspectRatio ratio={4/3}>
                <img 
                  src={image} 
                  alt={`Villa Mare Blu - Immagine ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Gallery className="h-16 w-16 text-muted-foreground opacity-30" />
          <h2 className="mt-4 text-xl font-medium">Nessuna immagine disponibile</h2>
          <p className="mt-2 text-muted-foreground">
            Non ci sono ancora immagini nella galleria.
          </p>
        </div>
      )}
      
      {/* Modal visualizzazione immagine */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Immagine ingrandita" 
              className="max-h-[90vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

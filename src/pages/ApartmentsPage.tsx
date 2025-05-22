
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Bed, Home, ArrowRight, ArrowLeft, Sun, ThermometerSun } from "lucide-react";
import { apartments as defaultApartments, Apartment } from "@/data/apartments";
import { imageService } from "@/utils/imageService";

const ApartmentGallery = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-md mt-4">
      <div className="absolute inset-0">
        <img 
          src={imageService.getImageUrl(images[currentIndex]) || "/placeholder.svg"} 
          alt={`Immagine ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            console.error(`Failed to load image in gallery: ${images[currentIndex]}`);
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
        {images.map((_, idx) => (
          <button 
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Vai all'immagine ${idx + 1}`}
          />
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
            aria-label="Immagine precedente"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
            aria-label="Immagine successiva"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

const ApartmentModal = ({ apartment }: { apartment: Apartment & { gallery?: string[] } }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Dettagli
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{apartment.name}</DialogTitle>
          <DialogDescription>{apartment.description}</DialogDescription>
        </DialogHeader>
        
        <ApartmentGallery images={apartment.gallery && apartment.gallery.length > 0 ? apartment.gallery : apartment.images} />
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">Descrizione dettagliata</h4>
          <p className="text-sm text-muted-foreground">{apartment.longDescription}</p>
        </div>

        {apartment.CIN && (
          <div className="text-xs text-muted-foreground">
            CIN: {apartment.CIN}
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Caratteristiche</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              <span>{apartment.beds} {apartment.beds === 1 ? 'posto letto' : 'posti letto'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <span>{apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-5 w-5 text-primary" />
              <span>{apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}</span>
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {apartment.services && apartment.services.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link to="/preventivo">Richiedi Disponibilità</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ApartmentsPage = () => {
  const [apartments, setApartments] = useState<Apartment[]>(defaultApartments);
  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);

  // Load apartments and their images from localStorage
  useEffect(() => {
    // ... keep existing code (loadData function)
    
    const checkApartmentImages = async () => {
      const result: { [key: string]: string[] } = {};
      setLoading(true);
      
      // Prima pulisci la cache delle immagini
      imageService.clearImageCache();
      
      // Utilizzare il nuovo metodo scanApartmentImages per ogni appartamento
      for (const apt of apartments) {
        console.log(`Scansione immagini per appartamento ${apt.id}...`);
        const images = await imageService.scanApartmentImages(apt.id);
        
        if (images && images.length > 0) {
          result[apt.id] = images;
          console.log(`Trovate ${images.length} immagini per ${apt.id}`);
        }
      }
      
      // Aggiorna lo stato solo se abbiamo trovato nuove immagini
      if (Object.keys(result).length > 0) {
        setApartmentImages(prevState => ({...prevState, ...result}));
        
        // Salva in localStorage
        const existingImagesStr = localStorage.getItem("apartmentImages");
        const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : {};
        const updatedImages = {...existingImages, ...result};
        localStorage.setItem("apartmentImages", JSON.stringify(updatedImages));
        
        // Notifica altri componenti del cambiamento
        window.dispatchEvent(new CustomEvent("apartmentImagesUpdated"));
      }
      
      setLoading(false);
    };
    
    // Carica dati da localStorage
    const loadData = () => {
      console.log("Caricamento appartamenti e immagini da localStorage");
      
      // Load apartments
      const savedApartments = localStorage.getItem("apartments");
      if (savedApartments) {
        try {
          const parsedApartments = JSON.parse(savedApartments);
          console.log("Appartamenti caricati:", parsedApartments);
          setApartments(parsedApartments);
        } catch (error) {
          console.error("Errore nel parsing degli appartamenti salvati:", error);
        }
      }
      
      // Load apartment images
      const savedImages = localStorage.getItem("apartmentImages");
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          console.log("Immagini appartamenti caricate:", parsedImages);
          setApartmentImages(parsedImages);
        } catch (error) {
          console.error("Errore nel parsing delle immagini degli appartamenti:", error);
        }
      }
      
      // Cerca immagini degli appartamenti sul server
      checkApartmentImages();
    };
    
    loadData();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "apartments" || e.key === "apartmentImages" || e.key === "apartmentCovers") {
        loadData();
      }
    };
    
    // Also listen for custom events for same-window updates
    const handleCustomEvent = () => {
      loadData();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apartmentImagesUpdated", handleCustomEvent);
    
    // Aggiungi handler per la pressione del tasto F5
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        checkApartmentImages();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apartmentImagesUpdated", handleCustomEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [apartments]);
  
  // Prepare apartment data with gallery images
  const apartmentData = apartments.map(apt => {
    const aptImages = apartmentImages[apt.id] || [];
    const coverIndices = (() => {
      const savedCovers = localStorage.getItem("apartmentCovers");
      if (savedCovers) {
        try {
          return JSON.parse(savedCovers);
        } catch (error) {
          console.error("Failed to parse saved cover indices:", error);
          return {};
        }
      }
      return {};
    })();
    
    const coverImageIndex = coverIndices[apt.id] ?? 0;
    
    // Get the cover image (first image) and all images for gallery
    let coverImage = "/placeholder.svg";
    if (aptImages.length > 0 && coverImageIndex >= 0 && coverImageIndex < aptImages.length) {
      coverImage = aptImages[coverImageIndex];
    } else if (apt.images && apt.images.length > 0) {
      coverImage = apt.images[0];
    }
    
    console.log(`Apartment ${apt.id} cover image:`, coverImage);
    console.log(`Apartment ${apt.id} gallery images:`, aptImages);
    
    return {
      ...apt,
      images: [coverImage, ...(apt.images?.slice(1) || [])],
      gallery: aptImages.length > 0 ? aptImages : apt.images,
    };
  });

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">I Nostri Appartamenti</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scopri i nostri confortevoli appartamenti, tutti con vista sul mare e accesso privato. 
          Ogni appartamento è completamente attrezzato per garantirti un soggiorno perfetto.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Caricamento appartamenti in corso...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {apartmentData.map((apartment) => (
            <Card key={apartment.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-[4/3] relative">
                <img 
                  src={imageService.getImageUrl(apartment.images[0])} 
                  alt={apartment.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load apartment image: ${apartment.images[0]}`);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle>{apartment.name}</CardTitle>
                <CardDescription>Piano {apartment.floor}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-primary" />
                    <span>{apartment.beds} {apartment.beds === 1 ? 'posto letto' : 'posti letto'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground line-clamp-3">
                  {apartment.description}
                </p>
              </CardContent>
              <CardFooter>
                <ApartmentModal apartment={apartment} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Button 
          variant="outline"
          onClick={() => {
            imageService.clearImageCache();
            window.location.reload();
          }}
        >
          Aggiorna visualizzazione immagini
        </Button>
      </div>
    </div>
  );
};

export default ApartmentsPage;

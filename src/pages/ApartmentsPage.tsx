import * as React from "react";
import { useEffect, useState, useCallback } from "react";
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
import { Bed, Home, ArrowRight, ArrowLeft, Sun, ThermometerSun, RefreshCcw } from "lucide-react";
import { apartments as defaultApartments, Apartment } from "@/data/apartments";
import { imageService } from "@/utils/imageService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Componente ottimizzato per il caricamento progressivo delle immagini
const ProgressiveImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState("/placeholder.svg");
  
  useEffect(() => {
    // Reset dello stato quando cambia il src
    if (src !== "/placeholder.svg") {
      setIsLoaded(false);
      setImgSrc("/placeholder.svg");
      
      const img = new Image();
      img.onload = () => {
        setImgSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        setImgSrc("/placeholder.svg");
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [src]);
  
  return (
    <>
      {!isLoaded && <Skeleton className={`${className} absolute inset-0`} />}
      <img 
        src={imgSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={(e) => {
          console.error(`Error in image render: ${src}`);
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
    </>
  );
};

const ApartmentGallery = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Precarica la prossima immagine per una transizione più fluida
  useEffect(() => {
    if (images.length > 1) {
      const nextIdx = (currentIndex + 1) % images.length;
      imageService.preloadImage(images[nextIdx]);
    }
  }, [currentIndex, images]);

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-md mt-4">
      <div className="absolute inset-0">
        <ProgressiveImage 
          src={images[currentIndex] || "/placeholder.svg"} 
          alt={`Immagine ${currentIndex + 1}`} 
          className="w-full h-full object-cover"
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
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoadingAdditionalImages, setIsLoadingAdditionalImages] = useState(false);
  
  // Funzione aggiornata per caricare le immagini da Supabase
  const loadApartmentImages = useCallback(async (apartments: Apartment[], showLoadingState = false) => {
    console.log("Loading apartment images from Supabase...");
    
    if (showLoadingState) {
      setLoading(true);
      setLoadingProgress(0);
    }
    
    const result: { [key: string]: string[] } = {};
    const total = apartments.length;
    let completed = 0;
    
    // Carica le immagini da Supabase per ogni appartamento
    for (const apt of apartments) {
      try {
        console.log(`Loading images for apartment ${apt.id} from Supabase`);
        
        const images = await imageService.scanApartmentImages(apt.id);
        
        if (images && images.length > 0) {
          console.log(`Found ${images.length} images for apartment ${apt.id}`);
          result[apt.id] = images;
        } else {
          console.log(`No images found for apartment ${apt.id}`);
        }
        
        completed++;
        if (showLoadingState) {
          setLoadingProgress(Math.round((completed / total) * 100));
        }
      } catch (error) {
        console.error(`Error loading images for apartment ${apt.id}:`, error);
        completed++;
        if (showLoadingState) {
          setLoadingProgress(Math.round((completed / total) * 100));
        }
      }
    }
    
    console.log("Apartment images loaded:", result);
    
    // Aggiorna lo stato con le immagini trovate
    setApartmentImages(prevState => ({...prevState, ...result}));
    
    // Salva in localStorage per cache
    const existingImagesStr = localStorage.getItem("apartmentImages");
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : {};
    const updatedImages = {...existingImages, ...result};
    localStorage.setItem("apartmentImages", JSON.stringify(updatedImages));
    
    // Notifica altri componenti
    window.dispatchEvent(new CustomEvent("apartmentImagesUpdated"));
    
    if (showLoadingState) {
      setLoading(false);
    }
    
    return result;
  }, []);
  
  // Carica dati e immagini all'avvio
  useEffect(() => {
    const loadData = async () => {
      console.log("Loading apartment data and images...");
      
      // Carica appartamenti da localStorage
      const savedApartments = localStorage.getItem("apartments");
      let currentApartments = [...defaultApartments];
      
      if (savedApartments) {
        try {
          currentApartments = JSON.parse(savedApartments);
          setApartments(currentApartments);
        } catch (error) {
          console.error("Errore nel parsing degli appartamenti:", error);
        }
      }
      
      // Carica sempre le immagini da Supabase (non più da localStorage)
      console.log("Loading fresh images from Supabase...");
      setIsLoadingAdditionalImages(true);
      
      try {
        await loadApartmentImages(currentApartments, false);
      } catch (error) {
        console.error("Error loading images from Supabase:", error);
        toast.error("Errore nel caricamento delle immagini");
      } finally {
        setIsLoadingAdditionalImages(false);
      }
    };
    
    loadData();
    
    // Listen for storage changes and custom events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "apartments") {
        loadData();
      }
    };
    
    const handleCustomEvent = () => {
      loadData();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apartmentImagesUpdated", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apartmentImagesUpdated", handleCustomEvent);
    };
  }, [loadApartmentImages]);
  
  // Funzione per aggiornare manualmente le immagini
  const refreshImages = async () => {
    toast.info("Aggiornamento immagini da Supabase...");
    
    // Pulisci la cache
    imageService.clearImageCache();
    
    // Ricarica le immagini da Supabase
    await loadApartmentImages(apartments, true);
    
    toast.success("Immagini aggiornate da Supabase!");
  };
  
  // Prepare apartment data with Supabase images
  const apartmentData = apartments.map(apt => {
    const aptImages = apartmentImages[apt.id] || [];
    
    // Use Supabase images if available, otherwise fallback to default
    let coverImage = "/placeholder.svg";
    if (aptImages.length > 0) {
      coverImage = aptImages[0];
    } else if (apt.images && apt.images.length > 0) {
      coverImage = apt.images[0];
    }
    
    return {
      ...apt,
      images: aptImages.length > 0 ? aptImages : (apt.images || []),
      gallery: aptImages.length > 0 ? aptImages : (apt.images || []),
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
      
      {loading && loadingProgress > 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Caricamento immagini da Supabase...</p>
            <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{loadingProgress}%</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {apartmentData.map((apartment) => (
            <Card key={apartment.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-[4/3] relative bg-muted">
                <ProgressiveImage 
                  src={apartment.images[0]} 
                  alt={apartment.name}
                  className="w-full h-full object-cover"
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
          onClick={refreshImages}
          disabled={loading || isLoadingAdditionalImages}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${loading || isLoadingAdditionalImages ? 'animate-spin' : ''}`} />
          {isLoadingAdditionalImages ? "Caricamento da Supabase..." : "Aggiorna immagini da Supabase"}
        </Button>
      </div>
    </div>
  );
};

export default ApartmentsPage;

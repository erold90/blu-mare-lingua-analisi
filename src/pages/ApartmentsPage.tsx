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
          src={imageService.getImageUrl(images[currentIndex]) || "/placeholder.svg"} 
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
  const [loading, setLoading] = useState(false); // Cambio cruciale: inizializza a false
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoadingAdditionalImages, setIsLoadingAdditionalImages] = useState(false);
  
  // Funzione ottimizzata per caricare le immagini
  const loadApartmentImages = useCallback(async (apartments: Apartment[], showLoadingState = false) => {
    // Mostra il loader solo se richiesto esplicitamente (per refresh manuali)
    if (showLoadingState) {
      setLoading(true);
      setLoadingProgress(0);
    }
    
    const result: { [key: string]: string[] } = {};
    const total = apartments.length;
    
    // Carichiamo le immagini con un limite di concorrenza
    // per evitare di sovraccaricare il browser
    const concurrencyLimit = 3; // Aumentato da 2 a 3 per velocizzare
    let completed = 0;
    
    const loadBatch = async (startIdx: number) => {
      const endIdx = Math.min(startIdx + concurrencyLimit - 1, apartments.length - 1);
      
      const batchPromises = [];
      for (let i = startIdx; i <= endIdx; i++) {
        const apt = apartments[i];
        batchPromises.push(
          imageService.scanApartmentImages(apt.id).then(images => {
            if (images && images.length > 0) {
              result[apt.id] = images;
            }
            completed++;
            if (showLoadingState) {
              setLoadingProgress(Math.round((completed / total) * 100));
            }
          })
        );
      }
      
      await Promise.all(batchPromises);
      
      // Se ci sono altri appartamenti da processare, carica il prossimo batch
      if (endIdx < apartments.length - 1) {
        return loadBatch(endIdx + 1);
      }
    };
    
    // Inizia il caricamento
    await loadBatch(0);
    
    // Aggiorna lo stato con le immagini trovate
    setApartmentImages(prevState => ({...prevState, ...result}));
    
    // Salva in localStorage
    const existingImagesStr = localStorage.getItem("apartmentImages");
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : {};
    const updatedImages = {...existingImages, ...result};
    localStorage.setItem("apartmentImages", JSON.stringify(updatedImages));
    
    // Notifica altri componenti
    window.dispatchEvent(new CustomEvent("apartmentImagesUpdated"));
    
    // Finito di caricare - solo se stavamo mostrando lo stato di caricamento
    if (showLoadingState) {
      setLoading(false);
    }
    
    return result;
  }, []);
  
  // Carica dati e immagini all'avvio
  useEffect(() => {
    const loadData = async () => {
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
      
      // Carica immagini appartamenti da localStorage (estremamente veloce)
      const savedImages = localStorage.getItem("apartmentImages");
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          setApartmentImages(parsedImages);
          
          // Precarica immediatamente le prime immagini di copertina per visualizzazione istantanea
          const coverImages: string[] = [];
          Object.values(parsedImages).forEach(images => {
            if (Array.isArray(images) && images.length > 0) {
              coverImages.push(images[0]);
            }
          });
          
          // Precarica subito tutte le immagini di copertina
          imageService.preloadImages(coverImages, 4);
          
          // Carica in background le immagini aggiornate senza bloccare l'interfaccia
          // e senza mostrare il loader per non disturbare l'utente
          setIsLoadingAdditionalImages(true);
          setTimeout(() => {
            loadApartmentImages(currentApartments, false).finally(() => {
              setIsLoadingAdditionalImages(false);
            });
          }, 500);
        } catch (error) {
          console.error("Errore nel parsing delle immagini:", error);
          // In caso di errore, carica le immagini normalmente
          loadApartmentImages(currentApartments, false);
        }
      } else {
        // Nessun dato in cache, carica le immagini ma senza mostrare il loader
        // per dare l'impressione che la pagina sia già pronta
        loadApartmentImages(currentApartments, false);
      }
    };
    
    loadData();
    
    // Listen for storage changes and custom events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "apartments" || e.key === "apartmentImages") {
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
    toast.info("Aggiornamento immagini in corso...");
    
    // Prima pulisci la cache
    imageService.clearImageCache();
    
    // Poi ricarica le immagini mostrando il loader
    await loadApartmentImages(apartments, true);
    
    toast.success("Immagini aggiornate con successo!");
  };
  
  // Prepare apartment data with gallery images
  const apartmentData = apartments.map(apt => {
    const aptImages = apartmentImages[apt.id] || [];
    const coverIndices = (() => {
      const savedCovers = localStorage.getItem("apartmentCovers");
      if (savedCovers) {
        try {
          return JSON.parse(savedCovers);
        } catch (error) {
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
      
      {loading && loadingProgress > 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Caricamento immagini...</p>
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
                  src={imageService.getImageUrl(apartment.images[0])} 
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
          {isLoadingAdditionalImages ? "Ottimizzazione immagini..." : "Aggiorna immagini"}
        </Button>
      </div>
    </div>
  );
};

export default ApartmentsPage;

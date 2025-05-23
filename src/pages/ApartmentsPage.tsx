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
import { Bed, Home, ArrowRight, ArrowLeft, Sun, ThermometerSun, RefreshCcw, ChevronRight, Sparkles } from "lucide-react";
import { apartments as defaultApartments, Apartment } from "@/data/apartments";
import { imageService } from "@/utils/imageService";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const changeImage = (newIndex: number) => {
    if (isTransitioning || newIndex === currentIndex) return;
    
    setIsTransitioning(true);
    
    // Smooth transition delay
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    changeImage(newIndex);
  };

  // Precarica la prossima immagine per una transizione più fluida
  useEffect(() => {
    if (images.length > 1) {
      const nextIdx = (currentIndex + 1) % images.length;
      imageService.preloadImage(images[nextIdx]);
      
      // Precarica anche l'immagine precedente
      const prevIdx = (currentIndex - 1 + images.length) % images.length;
      imageService.preloadImage(images[prevIdx]);
    }
  }, [currentIndex, images]);

  return (
    <div className="relative w-full h-96 md:h-[500px] lg:h-[700px] overflow-hidden rounded-lg mt-4 bg-gray-100">
      {/* Contenitore per le transizioni fluide */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 z-0'
            }`}
            style={{
              transform: index === currentIndex 
                ? 'translateX(0)' 
                : index < currentIndex 
                  ? 'translateX(-100%)' 
                  : 'translateX(100%)'
            }}
          >
            <ProgressiveImage 
              src={image || "/placeholder.svg"} 
              alt={`Immagine ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Overlay per transizione */}
        <div 
          className={`absolute inset-0 bg-black/10 transition-opacity duration-300 pointer-events-none ${
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      
      {images.length > 1 && (
        <>
          {/* Indicatori con animazioni migliorate */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <button 
                key={idx}
                className={`transition-all duration-300 ease-out rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-3 bg-white shadow-lg' 
                    : 'w-3 h-3 bg-white/60 hover:bg-white/80 hover:scale-110'
                }`}
                onClick={() => changeImage(idx)}
                aria-label={`Vai all'immagine ${idx + 1}`}
              />
            ))}
          </div>
          
          {/* Pulsanti di navigazione con effetti migliorati */}
          <button
            onClick={prevImage}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:bg-black/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm z-20 group"
            aria-label="Immagine precedente"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          <button
            onClick={nextImage}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:bg-black/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm z-20 group"
            aria-label="Immagine successiva"
          >
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          
          {/* Contatore immagini */}
          <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

const ApartmentModal = ({ apartment }: { apartment: Apartment & { gallery?: string[] } }) => {
  // Helper function to get climate control text for an apartment
  const getClimateControlText = (apartment: Apartment) => {
    if (apartment.id === "appartamento-1") {
      return "Fresco Naturale";
    }
    return apartment.hasAirConditioning ? "Climatizzatore" : "Ventilazione Naturale";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="group bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span>Dettagli</span>
          <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Appartamento Premium</span>
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-serif bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {apartment.name}
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {apartment.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative z-10">
          <ApartmentGallery images={apartment.gallery && apartment.gallery.length > 0 ? apartment.gallery : apartment.images} />
          
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-500" />
              Descrizione dettagliata
            </h4>
            <p className="text-muted-foreground leading-relaxed">{apartment.longDescription}</p>
          </div>

          {apartment.CIN && (
            <div className="mt-4 text-sm text-muted-foreground bg-blue-50/50 backdrop-blur-sm p-3 rounded-lg border border-blue-100">
              <strong>CIN:</strong> {apartment.CIN}
            </div>
          )}
          
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Caratteristiche Premium
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                <Bed className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{apartment.beds} {apartment.beds === 1 ? 'posto letto' : 'posti letto'}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                <Sun className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : 'Spazio Esterno'}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                <ThermometerSun className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{getClimateControlText(apartment)}</span>
              </div>
            </div>
            
            {apartment.services && apartment.services.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-lg">Servizi Inclusi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {apartment.services.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              asChild
            >
              <Link to="/preventivo" className="flex items-center gap-3">
                <span>Calcola Preventivo</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
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
  const [scrollY, setScrollY] = useState(0);
  
  // Carica le immagini da Supabase
  const loadApartmentImages = useCallback(async (apartments: Apartment[], showLoadingState = false) => {
    console.log("Loading apartment images from Supabase...");
    
    if (showLoadingState) {
      setLoading(true);
      setLoadingProgress(0);
    }
    
    const result: { [key: string]: string[] } = {};
    const total = apartments.length;
    let completed = 0;
    
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
    setApartmentImages(prevState => ({...prevState, ...result}));
    
    const existingImagesStr = localStorage.getItem("apartmentImages");
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : {};
    const updatedImages = {...existingImages, ...result};
    localStorage.setItem("apartmentImages", JSON.stringify(updatedImages));
    
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
      
      console.log("Loading fresh images from Supabase...");
      setIsLoadingAdditionalImages(true);
      
      try {
        await loadApartmentImages(currentApartments, false);
      } catch (error) {
        console.error("Error loading images from Supabase:", error);
      } finally {
        setIsLoadingAdditionalImages(false);
      }
    };
    
    loadData();
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apartmentImagesUpdated", handleCustomEvent);
    };
  }, [loadApartmentImages]);
  
  const refreshImages = async () => {
    imageService.clearImageCache();
    await loadApartmentImages(apartments, true);
  };
  
  // Prepare apartment data with Supabase images
  const apartmentData = apartments.map(apt => {
    const aptImages = apartmentImages[apt.id] || [];
    
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

  // Helper function to get climate control text for an apartment
  const getClimateControlText = (apartment: Apartment) => {
    if (apartment.id === "appartamento-1") {
      return "Fresco Naturale";
    }
    return apartment.hasAirConditioning ? "Climatizzatore" : "Ventilazione Naturale";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse" 
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full blur-3xl animate-pulse animation-delay-1000" 
          style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container px-6 py-12 md:py-20 relative z-10">
        {/* Header with elegant styling */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-serif font-semibold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
              I Nostri Appartamenti
            </span>
          </h1>
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Scopri i nostri <span className="font-medium text-primary">appartamenti di lusso</span>, 
            tutti con vista sul mare e accesso privato. Ogni appartamento è completamente attrezzato 
            per garantirti un <span className="font-medium text-primary">soggiorno perfetto</span>.
          </p>
        </div>
        
        {loading && loadingProgress > 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6">
                  <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
                  <p className="text-lg font-medium">Caricamento immagini premium...</p>
                  <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{loadingProgress}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="animate-fade-in animation-delay-300">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {apartmentData.map((apartment, index) => (
                <Card 
                  key={apartment.id} 
                  className={`overflow-hidden h-full flex flex-col bg-white/80 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                    <ProgressiveImage 
                      src={apartment.images[0]} 
                      alt={apartment.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Premium</span>
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {apartment.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Piano {apartment.floor} • Vista {apartment.view}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                        <Bed className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{apartment.beds} {apartment.beds === 1 ? 'posto' : 'posti'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50/50 to-transparent rounded-lg">
                        <Sun className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">
                          {apartment.hasVeranda ? 'Veranda' : apartment.hasTerrace ? 'Terrazza' : 'Esterno'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50/50 to-transparent rounded-lg">
                        <ThermometerSun className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">
                          {getClimateControlText(apartment)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {apartment.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <ApartmentModal apartment={apartment} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-16 text-center animate-fade-in animation-delay-500">
          <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardContent className="p-6">
              <Button 
                variant="outline"
                onClick={refreshImages}
                disabled={loading || isLoadingAdditionalImages}
                className="group bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading || isLoadingAdditionalImages ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isLoadingAdditionalImages ? "Caricamento..." : "Aggiorna Immagini"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50/40 to-transparent pointer-events-none" />
    </div>
  );
};

export default ApartmentsPage;

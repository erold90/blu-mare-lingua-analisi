
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { imageService } from "@/utils/imageService";
import { toast } from "sonner";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Hero image path - direttamente dalla cartella public
  const heroImagePath = '/images/hero/hero.jpg';
  
  // Immagine fallback nel caso in cui l'immagine hero non venga trovata
  const fallbackImage = "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  // Ottieni la posizione dell'immagine dalle impostazioni, default a center
  const imagePosition = siteSettings.heroImagePosition || "center";
  
  // Use State per memorizzare l'URL effettivo dell'immagine con cache busting
  const [imageUrl, setImageUrl] = useState("");
  
  // Funzione per verificare l'immagine hero
  const checkHeroImage = async () => {
    setIsLoading(true);
    
    try {
      // Debug del caricamento dell'immagine
      console.log(`Checking hero image (attempt ${retryCount + 1})...`);
      await imageService.debugImage(heroImagePath);
      
      // Verifica se l'immagine hero esiste
      const exists = await imageService.checkImageExists(heroImagePath);
      console.log(`Hero image exists check: ${exists}`);
      
      if (exists) {
        // Ottieni URL con cache busting
        const url = imageService.getImageUrl(heroImagePath);
        setImageUrl(url);
        setImageError(false);
        console.log("Hero image URL set to:", url);
        
        // Forza il ricaricamento dell'immagine
        const reloaded = await imageService.forceReloadImage(heroImagePath);
        console.log("Force reload result:", reloaded);
      } else {
        console.error("Hero image not found at path:", heroImagePath);
        toast.error("Immagine hero non trovata. Verifica che sia stata caricata correttamente nella cartella /public/images/hero/");
        setImageError(true);
      }
    } catch (error) {
      console.error("Error checking hero image:", error);
      setImageError(true);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };
  
  // Verifica se l'immagine esiste al caricamento del componente
  useEffect(() => {
    checkHeroImage();
  }, [heroImagePath, retryCount]);
  
  // Funzione per tentare nuovamente il caricamento dell'immagine
  const handleRetryLoading = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    toast.info("Tentativo di ricaricare l'immagine hero...");
  };
  
  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[80vh]"} relative overflow-hidden`}>
        {isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <>
            {/* Usa un div con background-image per una migliore gestione */}
            {!imageError ? (
              <div 
                className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage: `url('${imageUrl}')`,
                  backgroundPosition: imagePosition
                }}
              />
            ) : (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage: `url('${fallbackImage}')`,
                    backgroundPosition: imagePosition
                  }}
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                  Usando immagine di fallback
                </div>
              </>
            )}
          </>
        )}
        
        <div className="absolute inset-0 bg-black/40" />
        <div className={`absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center ${isMobile ? "pt-16" : ""}`}>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Villa MareBlu</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl font-light">La tua vacanza da sogno sul mare cristallino del Salento</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
            <Button size="lg" className="w-full" asChild>
              <Link to="/appartamenti">I Nostri Appartamenti</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white" asChild>
              <Link to="/preventivo">Richiedi Preventivo</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Aggiungi istruzioni per il caricamento delle immagini per gli admin */}
      {imageError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mt-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">Errore di caricamento immagine hero</p>
              <p>Verificare che l'immagine hero sia stata caricata nella cartella corretta:</p>
              <pre className="bg-red-100 p-2 mt-2 rounded">/public/images/hero/hero.jpg</pre>
              <p className="mt-2">Dopo aver caricato l'immagine, aggiornare la pagina.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryLoading} 
              disabled={isRetrying}
              className="flex items-center gap-1"
            >
              <RefreshCw size={16} className={`${isRetrying ? "animate-spin" : ""}`} />
              Riprova
            </Button>
          </div>
          
          <div className="mt-4 bg-amber-50 p-2 rounded border border-amber-200">
            <p className="font-semibold text-amber-800">Suggerimenti per la risoluzione:</p>
            <ul className="list-disc list-inside text-sm text-amber-700 mt-1">
              <li>Assicurati che il file sia esattamente chiamato "hero.jpg" (tutto minuscolo)</li>
              <li>Verifica che l'immagine sia in formato JPG</li>
              <li>Se stai usando GitHub, assicurati che l'immagine sia stata sincronizzata</li>
              <li>Prova a cancellare la cache del browser (Ctrl+F5 o Cmd+Shift+R)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

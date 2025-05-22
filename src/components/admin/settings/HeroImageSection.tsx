
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePositioner } from "./ImagePositioner";
import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { imageService } from "@/utils/imageService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = useState(siteSettings.heroImagePosition || "center");
  const [imageExists, setImageExists] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    setImagePreviewPosition(siteSettings.heroImagePosition || "center");
  }, [siteSettings.heroImagePosition]);

  // Il percorso è fisso a una directory nella cartella public
  const heroImagePath = '/images/hero/hero.jpg';

  // Controlla se l'immagine hero esiste
  useEffect(() => {
    const checkImage = async () => {
      setIsCheckingImage(true);
      try {
        // Debug dell'immagine
        await imageService.debugImage(heroImagePath);
        
        // Controlla se esiste
        const exists = await imageService.checkImageExists(heroImagePath);
        console.log(`Admin panel - hero image exists check: ${exists}`);
        setImageExists(exists);
        
        if (exists) {
          // Forza il ricaricamento dell'immagine
          await imageService.forceReloadImage(heroImagePath);
        }
      } catch (error) {
        setImageExists(false);
        console.error("Error checking hero image:", error);
      } finally {
        setIsCheckingImage(false);
        setIsRetrying(false);
      }
    };
    
    checkImage();
  }, [retryCount]);

  const handlePositionChange = (position: string) => {
    setImagePreviewPosition(position);
    updateSiteSettings({ heroImagePosition: position });
  };
  
  const handleRetryCheck = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    toast.info("Verifico nuovamente la presenza dell'immagine hero...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immagine Hero</CardTitle>
        <CardDescription>
          L'immagine principale visualizzata nella home page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {isCheckingImage ? (
            <Skeleton className="h-[300px] w-full" />
          ) : imageExists ? (
            <div>
              <ImagePositioner
                imageUrl={`${heroImagePath}?t=${Date.now()}`}
                currentPosition={imagePreviewPosition}
                onPositionChange={handlePositionChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Per cambiare l'immagine, caricare manualmente un file chiamato "hero.jpg" nella cartella /public/images/hero/
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <span>Immagine hero non trovata nella posizione corretta.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetryCheck}
                    disabled={isRetrying}
                    className="ml-auto flex items-center gap-1"
                  >
                    <RefreshCw size={16} className={`${isRetrying ? "animate-spin" : ""}`} />
                    Ricontrolla
                  </Button>
                </AlertDescription>
              </Alert>
              
              <div className="text-center p-6 border rounded-md">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium mb-2">Immagine hero non trovata</p>
                <div className="text-muted-foreground text-sm space-y-2">
                  <p className="font-semibold">Istruzioni:</p>
                  <ol className="list-decimal list-inside text-left">
                    <li>Caricare manualmente un file chiamato <code className="bg-gray-100 px-1 py-0.5 rounded">hero.jpg</code> (tutto minuscolo)</li>
                    <li>Posizionarlo nella cartella <code className="bg-gray-100 px-1 py-0.5 rounded">/public/images/hero/</code></li>
                    <li>Assicurarsi che l'immagine sia in formato JPG</li>
                    <li>Aggiornare la pagina dopo il caricamento</li>
                  </ol>
                </div>
                
                <div className="mt-4 bg-amber-50 p-3 rounded text-left border border-amber-200">
                  <p className="font-semibold text-amber-800 mb-2">Se hai caricato l'immagine via GitHub:</p>
                  <ol className="list-decimal list-inside text-sm text-amber-700">
                    <li>Verifica che il file si chiami esattamente "hero.jpg" (tutto minuscolo)</li>
                    <li>Assicurati che il percorso sia esattamente "/public/images/hero/"</li>
                    <li>Controlla che il commit sia stato completato e sincronizzato</li>
                    <li>Cancella la cache del browser con Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)</li>
                    <li>Usa il pulsante "Ricontrolla" per verificare nuovamente la presenza dell'immagine</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

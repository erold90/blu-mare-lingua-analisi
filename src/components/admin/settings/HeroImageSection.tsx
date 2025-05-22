
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePositioner } from "./ImagePositioner";
import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, AlertCircle } from "lucide-react";
import { imageService } from "@/utils/imageService";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = useState(siteSettings.heroImagePosition || "center");
  const [imageExists, setImageExists] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(true);
  
  useEffect(() => {
    setImagePreviewPosition(siteSettings.heroImagePosition || "center");
  }, [siteSettings.heroImagePosition]);

  // The path is fixed to a directory in the public folder
  const heroImagePath = '/images/hero/hero.jpg';

  // Check if the hero image exists
  useEffect(() => {
    const checkImage = async () => {
      setIsCheckingImage(true);
      try {
        // Debug image
        await imageService.debugImage(heroImagePath);
        
        // Check if exists
        const exists = await imageService.checkImageExists(heroImagePath);
        console.log(`Admin panel - hero image exists check: ${exists}`);
        setImageExists(exists);
      } catch (error) {
        setImageExists(false);
        console.error("Error checking hero image:", error);
      } finally {
        setIsCheckingImage(false);
      }
    };
    
    checkImage();
  }, []);

  const handlePositionChange = (position: string) => {
    setImagePreviewPosition(position);
    updateSiteSettings({ heroImagePosition: position });
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
                <AlertDescription>
                  Immagine hero non trovata nella posizione corretta.
                </AlertDescription>
              </Alert>
              
              <div className="text-center p-6 border rounded-md">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium mb-2">Immagine hero non trovata</p>
                <div className="text-muted-foreground text-sm space-y-2">
                  <p className="font-semibold">Istruzioni:</p>
                  <ol className="list-decimal list-inside text-left">
                    <li>Caricare manualmente un file chiamato <code className="bg-gray-100 px-1 py-0.5 rounded">hero.jpg</code></li>
                    <li>Posizionarlo nella cartella <code className="bg-gray-100 px-1 py-0.5 rounded">/public/images/hero/</code></li>
                    <li>Assicurarsi che l'immagine sia in formato JPG</li>
                    <li>Aggiornare la pagina dopo il caricamento</li>
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

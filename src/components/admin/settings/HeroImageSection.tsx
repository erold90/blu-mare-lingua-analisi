
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePositioner } from "./ImagePositioner";
import { useSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = useState(siteSettings.heroImagePosition || "center");
  const [imageExists, setImageExists] = useState(true);
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
        const response = await fetch(heroImagePath, { 
          method: 'HEAD',
          cache: 'no-cache' // Prevent caching so we always get the latest status
        });
        setImageExists(response.ok);
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
                imageUrl={heroImagePath}
                currentPosition={imagePreviewPosition}
                onPositionChange={handlePositionChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Per cambiare l'immagine, caricare manualmente un file chiamato "hero.jpg" nella cartella /public/images/hero/
              </p>
            </div>
          ) : (
            <div className="text-center p-6 border rounded-md">
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium mb-2">Immagine hero non trovata</p>
              <p className="text-muted-foreground">
                Caricare manualmente un file chiamato "hero.jpg" nella cartella /public/images/hero/
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

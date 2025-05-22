
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePositioner } from "./ImagePositioner";
import { useSettings } from "@/hooks/useSettings";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = React.useState(siteSettings.heroImagePosition || "center");
  
  React.useEffect(() => {
    setImagePreviewPosition(siteSettings.heroImagePosition || "center");
  }, [siteSettings.heroImagePosition]);

  // The path is now fixed to a directory in the public folder
  const currentHeroImage = '/images/hero/hero.jpg';

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
          <div>
            <ImagePositioner
              imageUrl={currentHeroImage}
              currentPosition={imagePreviewPosition}
              onPositionChange={handlePositionChange}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Per cambiare l'immagine, caricare manualmente un file chiamato "hero.jpg" nella cartella /public/images/hero/
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

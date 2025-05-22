
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Image as ImageIcon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { ImagePositioner } from "./ImagePositioner";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings, saveImageToStorage, deleteImageFromStorage } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = React.useState(siteSettings.heroImagePosition || "center");
  
  React.useEffect(() => {
    setImagePreviewPosition(siteSettings.heroImagePosition || "center");
  }, [siteSettings.heroImagePosition]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      // Delete the old hero image if it exists and is a storage path
      if (siteSettings.heroImage && (siteSettings.heroImage.startsWith('/images/') || siteSettings.heroImage.startsWith('/storage/'))) {
        deleteImageFromStorage(siteSettings.heroImage);
      }
      
      // Save the new image
      const imagePath = await saveImageToStorage(file, 'hero');
      
      // Update settings with the new path
      updateSiteSettings({ heroImage: imagePath });
      toast.success("Immagine hero aggiornata");
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast.error(`Errore durante il caricamento dell'immagine: ${(error as Error).message}`);
    }
  };

  const handlePositionChange = (position: string) => {
    setImagePreviewPosition(position);
    updateSiteSettings({ heroImagePosition: position });
    toast.success("Posizione immagine aggiornata");
  };

  const isValidImage = (url: string) => {
    return url && !url.includes("placeholder.svg");
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
            {isValidImage(siteSettings.heroImage) ? (
              <ImagePositioner
                imageUrl={siteSettings.heroImage}
                currentPosition={imagePreviewPosition}
                onPositionChange={handlePositionChange}
              />
            ) : (
              <div className="aspect-video rounded-md overflow-hidden border bg-muted relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nessuna immagine caricata</p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Si consiglia un'immagine in formato 16:9 con alta risoluzione
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => document.getElementById('hero-upload')?.click()}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Cambia immagine
            </Button>
            <Input
              id="hero-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

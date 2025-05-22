
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { ImagePositioner } from "./ImagePositioner";

export const HeroImageSection = () => {
  const { siteSettings, updateSiteSettings, saveImageToStorage } = useSettings();
  const [imagePreviewPosition, setImagePreviewPosition] = React.useState(siteSettings.heroImagePosition || "center");
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  
  React.useEffect(() => {
    setImagePreviewPosition(siteSettings.heroImagePosition || "center");
  }, [siteSettings.heroImagePosition]);

  const currentHeroImage = siteSettings.heroImage || '/placeholder.svg';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulazione di un caricamento progressivo
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Save the new image
      const imagePath = await saveImageToStorage(file, 'hero');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log("Immagine hero salvata con successo:", imagePath);
      
      // Update settings with the new path
      updateSiteSettings({ heroImage: imagePath });
      toast.success("Immagine hero aggiornata");
      
      // Ritardo prima di resettare lo stato di caricamento
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error uploading hero image:', error);
      setIsUploading(false);
      setUploadProgress(0);
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
            {isValidImage(currentHeroImage) ? (
              <ImagePositioner
                imageUrl={currentHeroImage}
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
            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Caricamento in corso ({uploadProgress}%)...</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => document.getElementById('hero-upload')?.click()}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" /> Cambia immagine
              </Button>
            )}
            <Input
              id="hero-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, AlertCircle, Upload, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { imageService, ImageRecord } from "@/services/imageService";
import { ImageUpload } from "../images/ImageUpload";

export const HeroImageSection = () => {
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadHeroImage = async () => {
    setIsLoading(true);
    try {
      // Timeout per evitare caricamenti infiniti
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading hero image')), 10000)
      );
      
      const loadPromise = imageService.getImagesByCategory('hero');
      
      const heroImages = await Promise.race([loadPromise, timeoutPromise]) as ImageRecord[];
      const primaryHero = heroImages.find(img => img.is_cover) || heroImages[0] || null;
      setHeroImage(primaryHero);
    } catch (error) {
      console.error('Error loading hero image:', error);
      // Non mostrare toast di errore se è solo un timeout, imposta solo null
      setHeroImage(null);
      if (!error.message?.includes('Timeout')) {
        toast.error("Errore nel caricamento dell'immagine hero");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeroImage();
  }, []);

  const handleUploadSuccess = () => {
    loadHeroImage();
    setShowUpload(false);
    toast.success("Immagine hero caricata con successo");
  };

  const handleDeleteHero = async () => {
    if (!heroImage) return;
    
    if (window.confirm('Sei sicuro di voler eliminare l\'immagine hero attuale?')) {
      const success = await imageService.deleteImage(heroImage.id, heroImage.file_path);
      if (success) {
        setHeroImage(null);
        toast.success("Immagine hero eliminata");
      }
    }
  };

  const handleSetAsPrimary = async (imageId: string) => {
    try {
      await imageService.updateImage(imageId, { is_cover: true });
      
      // Update other hero images to not be primary
      const heroImages = await imageService.getImagesByCategory('hero');
      const updatePromises = heroImages
        .filter(img => img.id !== imageId)
        .map(img => imageService.updateImage(img.id, { is_cover: false }));
      
      await Promise.all(updatePromises);
      loadHeroImage();
      toast.success("Immagine hero principale aggiornata");
    } catch (error) {
      console.error('Error setting primary hero image:', error);
      toast.error("Errore nell'impostare l'immagine principale");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immagine Hero</CardTitle>
        <CardDescription>
          L'immagine principale visualizzata nella home page (1920x1080px consigliato)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setShowUpload(!showUpload)}
              variant={showUpload ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {showUpload ? 'Nascondi upload' : 'Carica nuova immagine'}
            </Button>
            
            {heroImage && (
              <Button
                onClick={handleDeleteHero}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
            )}
          </div>

          {showUpload && (
            <ImageUpload
              category="hero"
              onUploadSuccess={handleUploadSuccess}
              maxFiles={1}
              className="mb-6"
            />
          )}

          {/* Hero Image Display */}
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : heroImage ? (
            <div className="space-y-4">
              <div className="relative rounded-md overflow-hidden border">
                <div className="aspect-video relative">
                  <img 
                    src={imageService.getImageUrl(heroImage.file_path)}
                    alt={heroImage.alt_text || "Immagine Hero"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Hero image failed to load');
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  {!heroImage.is_cover && (
                    <Button
                      onClick={() => handleSetAsPrimary(heroImage.id)}
                      className="absolute top-2 right-2"
                      size="sm"
                    >
                      Imposta come principale
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{heroImage.file_name}</p>
                {heroImage.alt_text && (
                  <p className="mt-1">{heroImage.alt_text}</p>
                )}
                {heroImage.is_cover && (
                  <p className="mt-1 text-green-600 font-medium">✓ Immagine principale attiva</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nessuna immagine hero trovata. Carica un'immagine per visualizzarla nella homepage.
                </AlertDescription>
              </Alert>
              
              <div className="text-center p-6 border rounded-md border-dashed">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium mb-2">Nessuna immagine hero</p>
                <p className="text-muted-foreground text-sm">
                  Usa il pulsante "Carica nuova immagine" per aggiungere un'immagine hero.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Istruzioni per l'immagine hero:</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Risoluzione consigliata: 1920x1080px per una qualità ottimale</li>
              <li>Formati supportati: JPEG, PNG, WebP</li>
              <li>L'immagine verrà visualizzata come sfondo della sezione hero nella homepage</li>
              <li>Puoi caricare più immagini e impostare quella principale</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { Plus, X, MoveUp, MoveDown, Image as ImageIcon, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { imageService, IMAGE_CATEGORIES, ImageMetadata } from "@/utils/imageService";

export const HomeImagesSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const isMobile = useIsMobile();
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [loadingImages, setLoadingImages] = React.useState(true);
  const [homeImages, setHomeImages] = React.useState<ImageMetadata[]>([]);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  
  // Carica le immagini all'avvio del componente
  React.useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      try {
        const result = await imageService.getImages(IMAGE_CATEGORIES.HERO);
        
        if (result.success) {
          setHomeImages(result.images);
          
          // Aggiorna i settings con i percorsi delle immagini
          updateSiteSettings({ 
            homeImages: result.images.map(img => img.path) 
          });
        } else {
          toast.error("Errore nel caricamento delle immagini: " + result.message);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle immagini:", error);
        toast.error("Errore nel caricamento delle immagini");
      } finally {
        setLoadingImages(false);
      }
    };
    
    loadImages();
  }, [updateSiteSettings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);
    setUploadProgress(0);
    
    try {
      const result = await imageService.uploadImage(
        file,
        IMAGE_CATEGORIES.HERO,
        {},
        setUploadProgress
      );
      
      if (result.success && result.metadata) {
        // Aggiorna l'elenco locale delle immagini
        setHomeImages(prev => [...prev, result.metadata!]);
        
        // Aggiorna i settings con i nuovi percorsi
        updateSiteSettings({
          homeImages: [...homeImages.map(img => img.path), result.metadata!.path]
        });
        
        toast.success("Immagine aggiunta con successo");
      } else {
        toast.error("Errore nel caricamento dell'immagine: " + result.message);
      }
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
      toast.error(`Errore durante il caricamento dell'immagine: ${(error as Error).message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = homeImages[index];
    
    try {
      // Elimina l'immagine dal server
      const result = await imageService.deleteImage(
        imageToRemove.id,
        IMAGE_CATEGORIES.HERO
      );
      
      if (result.success) {
        // Rimuovi l'immagine dall'elenco locale
        const updatedImages = [...homeImages];
        updatedImages.splice(index, 1);
        setHomeImages(updatedImages);
        
        // Aggiorna i settings
        updateSiteSettings({
          homeImages: updatedImages.map(img => img.path)
        });
        
        // Resetta l'anteprima se necessario
        if (previewImage === imageToRemove.path) {
          setPreviewImage(null);
        }
        
        toast.success("Immagine rimossa");
      } else {
        toast.error("Errore nella rimozione dell'immagine: " + result.message);
      }
    } catch (error) {
      console.error('Errore nella rimozione dell\'immagine:', error);
      toast.error("Errore nella rimozione dell'immagine");
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === homeImages.length - 1)
    ) {
      return;
    }

    const newImages = [...homeImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Scambia le immagini
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Aggiorna lo stato locale
    setHomeImages(newImages);
    
    // Aggiorna i settings
    updateSiteSettings({
      homeImages: newImages.map(img => img.path)
    });
    
    toast.success(`Immagine spostata ${direction === 'up' ? 'su' : 'giù'}`);
  };

  const handlePreviewClick = (image: ImageMetadata) => {
    setPreviewImage(image.path);
  };

  const ImagePreviewContent = () => (
    <div className="p-4">
      {previewImage ? (
        <div className="flex flex-col gap-4">
          <div className="aspect-video rounded-md overflow-hidden border">
            <img 
              src={previewImage} 
              alt="Anteprima" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setPreviewImage(null)}
          >
            Chiudi anteprima
          </Button>
        </div>
      ) : (
        <div className="text-center p-10">
          <p className="text-muted-foreground">Nessuna immagine selezionata</p>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immagini Galleria Home</CardTitle>
        <CardDescription>
          Gestisci le immagini che appaiono nella galleria della home page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadingImage && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Caricamento immagine...</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 gap-4">
            {loadingImages ? (
              <div className="text-center p-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Caricamento immagini...</p>
              </div>
            ) : homeImages.length === 0 ? (
              <div className="text-center p-6 border rounded-md bg-muted/20">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna immagine caricata</p>
              </div>
            ) : (
              homeImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className="flex items-center gap-3 border rounded-md p-2 bg-card"
                >
                  <div 
                    className="w-24 h-16 bg-muted rounded-sm overflow-hidden cursor-pointer relative"
                    onClick={() => handlePreviewClick(image)}
                  >
                    <img 
                      src={image.path} 
                      alt={`Immagine ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${image.path}`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">
                      Immagine {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {image.originalName}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                      <span className="sr-only">Sposta su</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === homeImages.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                      <span className="sr-only">Sposta giù</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Rimuovi</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => document.getElementById('home-images-upload')?.click()}
            className="flex items-center"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Caricamento...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> Aggiungi immagine
              </>
            )}
          </Button>
          <Input
            id="home-images-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  disabled={!previewImage}
                  className="ml-auto"
                >
                  {previewImage ? "Anteprima" : "Seleziona un'immagine"}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <ImagePreviewContent />
              </DrawerContent>
            </Drawer>
          ) : (
            previewImage && (
              <Button 
                variant="ghost" 
                onClick={() => setPreviewImage(null)}
                className="ml-auto"
              >
                Chiudi anteprima
              </Button>
            )
          )}
        </div>
        
        {!isMobile && previewImage && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <img 
              src={previewImage} 
              alt="Anteprima" 
              className="w-full h-auto max-h-[300px] object-contain" 
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          Si consiglia di caricare immagini in formato orizzontale (16:9) per una visualizzazione ottimale
        </p>
      </CardContent>
    </Card>
  );
};

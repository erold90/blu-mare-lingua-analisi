
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
import { getImage, deleteImage } from "@/utils/imageStorage";

export const HomeImagesSection = () => {
  const { siteSettings, updateSiteSettings, saveImageToStorage, isImageLoading, uploadProgress } = useSettings();
  const isMobile = useIsMobile();
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [loadedImages, setLoadedImages] = React.useState<{[key: string]: string}>({});
  const [loadingStates, setLoadingStates] = React.useState<{[key: string]: boolean}>({});
  
  // Ensure homeImages array exists
  const homeImages = siteSettings.homeImages || [];
  
  // Load all images on component mount
  React.useEffect(() => {
    const loadAllImages = async () => {
      // Initialize loading states
      const initialLoadingStates: {[key: string]: boolean} = {};
      homeImages.forEach(path => {
        initialLoadingStates[path] = true;
      });
      setLoadingStates(initialLoadingStates);
      
      // Load each image
      const imageData: {[key: string]: string} = {};
      
      for (const path of homeImages) {
        if (path.startsWith('/upload/')) {
          try {
            const storedImage = await getImage(path);
            if (storedImage && storedImage.data) {
              imageData[path] = storedImage.data;
            }
          } catch (error) {
            console.error(`Error loading image ${path}:`, error);
          }
        } else {
          imageData[path] = path;
        }
        
        // Update loading state for this image
        setLoadingStates(prev => ({
          ...prev,
          [path]: false
        }));
      }
      
      setLoadedImages(imageData);
    };
    
    loadAllImages();
  }, [homeImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      // Save the new image
      await saveImageToStorage(file, 'home');
      toast.success("Immagine aggiunta");
    } catch (error) {
      console.error('Error uploading home image:', error);
      toast.error(`Errore durante il caricamento dell'immagine: ${(error as Error).message}`);
    }
  };

  const removeImage = async (index: number) => {
    const imagePath = homeImages[index];
    
    // Create a new array without this image
    const newImages = [...homeImages];
    newImages.splice(index, 1);
    
    // Update settings
    updateSiteSettings({ homeImages: newImages });
    
    // Reset preview if this was the image being previewed
    if (previewImage === loadedImages[imagePath]) {
      setPreviewImage(null);
    }
    
    // Delete the image from storage if it's a stored image
    if (imagePath.startsWith('/upload/')) {
      try {
        await deleteImage(imagePath);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    toast.success("Immagine rimossa");
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === homeImages.length - 1)
    ) {
      return;
    }

    const newImages = [...homeImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    updateSiteSettings({ homeImages: newImages });
    toast.success(`Immagine spostata ${direction === 'up' ? 'su' : 'giù'}`);
  };

  const handlePreviewClick = (imagePath: string) => {
    const imageData = loadedImages[imagePath] || imagePath;
    setPreviewImage(imageData);
  };

  // Get image data for display
  const getImageData = (path: string): string => {
    return loadedImages[path] || path;
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
        {isImageLoading && (
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
            {homeImages.length === 0 ? (
              <div className="text-center p-6 border rounded-md bg-muted/20">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna immagine caricata</p>
              </div>
            ) : (
              homeImages.map((imagePath, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 border rounded-md p-2 bg-card"
                >
                  <div 
                    className="w-24 h-16 bg-muted rounded-sm overflow-hidden cursor-pointer relative"
                    onClick={() => handlePreviewClick(imagePath)}
                  >
                    {loadingStates[imagePath] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={getImageData(imagePath)} 
                        alt={`Immagine ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load image: ${imagePath}`);
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">
                      Immagine {index + 1}
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
            disabled={isImageLoading}
          >
            {isImageLoading ? (
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
            disabled={isImageLoading}
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

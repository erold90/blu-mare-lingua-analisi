
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { Plus, X, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export const HomeImagesSection = () => {
  const { siteSettings, updateSiteSettings, saveImageToStorage, deleteImageFromStorage } = useSettings();
  const isMobile = useIsMobile();
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  
  // Assicurati che homeImages esista
  const homeImages = siteSettings.homeImages || [];
  
  // Funzione per caricare l'immagine dal suo percorso
  const getImageFromStorage = (imagePath: string): string => {
    if (!imagePath) return '/placeholder.svg';
    
    if (imagePath.startsWith('/images/')) {
      // Recupera l'immagine dallo storage
      const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
      return imageStorage[imagePath] || imagePath;
    }
    
    return imagePath;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      // Save the new image
      const storagePath = await saveImageToStorage(file, 'home');
      
      // Update settings with the new path
      updateSiteSettings({ 
        homeImages: [...homeImages, storagePath] 
      });
      
      toast.success("Immagine aggiunta");
    } catch (error) {
      console.error('Error uploading home image:', error);
      toast.error(`Errore durante il caricamento dell'immagine: ${(error as Error).message}`);
    }
  };

  const removeImage = (index: number) => {
    const imagePath = homeImages[index];
    
    // Delete the image from storage if it's a storage path
    if (imagePath && (imagePath.startsWith('/images/') || imagePath.startsWith('/storage/'))) {
      deleteImageFromStorage(imagePath);
    }
    
    // Update the list
    const newImages = [...homeImages];
    newImages.splice(index, 1);
    updateSiteSettings({ homeImages: newImages });
    
    // Reset preview if this was the image being previewed
    if (previewImage === imagePath) {
      setPreviewImage(null);
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
    const imageUrl = getImageFromStorage(imagePath);
    setPreviewImage(imageUrl);
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
                    className="w-24 h-16 bg-muted rounded-sm overflow-hidden cursor-pointer"
                    onClick={() => handlePreviewClick(imagePath)}
                  >
                    <img 
                      src={getImageFromStorage(imagePath)} 
                      alt={`Immagine ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${imagePath}`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
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
          >
            <Plus className="h-4 w-4 mr-1" /> Aggiungi immagine
          </Button>
          <Input
            id="home-images-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
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

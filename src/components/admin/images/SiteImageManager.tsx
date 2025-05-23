import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from './ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { imageService, ImageRecord, ImageCategory } from '@/services/imageService';

export const SiteImageManager: React.FC = () => {
  console.log('=== SiteImageManager Component Rendered ===');
  
  const [heroImages, setHeroImages] = useState<ImageRecord[]>([]);
  const [homeGalleryImages, setHomeGalleryImages] = useState<ImageRecord[]>([]);
  const [socialImages, setSocialImages] = useState<ImageRecord[]>([]);
  const [faviconImages, setFaviconImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ImageCategory>('hero');

  const loadImages = async () => {
    setLoading(true);
    try {
      console.log('Loading site images...');
      const [hero, homeGallery, social, favicon] = await Promise.all([
        imageService.getImagesByCategory('hero'),
        imageService.getImagesByCategory('home_gallery'),
        imageService.getImagesByCategory('social'),
        imageService.getImagesByCategory('favicon')
      ]);

      console.log('Site images loaded:', { hero, homeGallery, social, favicon });
      setHeroImages(hero);
      setHomeGalleryImages(homeGallery);
      setSocialImages(social);
      setFaviconImages(favicon);
    } catch (error) {
      console.error('Error loading site images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUploadSuccess = async () => {
    console.log('Upload successful, reloading images...');
    await loadImages();
    toast.success('Immagini caricate con successo');
  };

  const handleDeleteImage = async (image: ImageRecord) => {
    if (window.confirm('Sei sicuro di voler eliminare questa immagine?')) {
      console.log('Deleting image:', image.id);
      const success = await imageService.deleteImage(image.id, image.file_path);
      if (success) {
        await loadImages();
      }
    }
  };

  const handleSetPrimary = async (image: ImageRecord) => {
    try {
      console.log('Setting primary image:', image.id, 'category:', image.category);
      
      // First set this image as primary
      await imageService.updateImage(image.id, { is_cover: true });
      
      // Then update other images of the same category to not be primary
      const currentImages = getCurrentImages(image.category);
      const updatePromises = currentImages
        .filter(img => img.id !== image.id && img.is_cover)
        .map(img => {
          console.log('Removing primary status from:', img.id);
          return imageService.updateImage(img.id, { is_cover: false });
        });
      
      await Promise.all(updatePromises);
      
      console.log('Primary image updated successfully');
      toast.success('Immagine principale impostata');
      await loadImages();
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Errore nell\'impostare l\'immagine principale');
    }
  };

  const getCurrentImages = (category: ImageCategory): ImageRecord[] => {
    switch (category) {
      case 'hero': return heroImages;
      case 'home_gallery': return homeGalleryImages;
      case 'social': return socialImages;
      case 'favicon': return faviconImages;
      default: return [];
    }
  };

  const getMaxFiles = (category: ImageCategory): number => {
    switch (category) {
      case 'hero': return 1;
      case 'social': return 1;
      case 'favicon': return 1;
      case 'home_gallery': return 10;
      default: return 1;
    }
  };

  const getDescription = (category: ImageCategory): string => {
    switch (category) {
      case 'hero': return 'Immagine principale della homepage (1920x1080px consigliato)';
      case 'home_gallery': return 'Galleria di immagini per la sezione home';
      case 'social': return 'Immagine per i social media e condivisioni (1200x630px consigliato)';
      case 'favicon': return 'Icona del sito (32x32px o 64x64px, formato ICO/PNG)';
      default: return '';
    }
  };

  const ImageGrid: React.FC<{ images: ImageRecord[]; category: ImageCategory }> = ({ images, category }) => {
    console.log(`Rendering ImageGrid for category: ${category}, images count: ${images.length}`);
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{getDescription(category)}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          <p className="text-sm text-yellow-800">
            🔧 Debug: Controlla la console del browser per i log dettagliati dell'upload
          </p>
        </div>
        
        <ImageUpload
          category={category}
          onUploadSuccess={handleUploadSuccess}
          maxFiles={getMaxFiles(category)}
          className="mb-6"
        />

        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nessuna immagine caricata
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={imageService.getImageUrl(image.file_path)}
                    alt={image.alt_text || image.file_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', image.file_path);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  {image.is_cover && (
                    <Badge className="absolute top-2 left-2">
                      Principale
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_cover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimary(image)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {image.file_name}
                  </p>
                  {image.alt_text && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {image.alt_text}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Caricamento immagini...</div>
        </CardContent>
      </Card>
    );
  }

  console.log('SiteImageManager - Current active tab:', activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Immagini Sito</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('Tab changed to:', value);
          setActiveTab(value as ImageCategory);
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="home_gallery">Galleria Home</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="favicon">Favicon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero" className="mt-6">
            <ImageGrid images={heroImages} category="hero" />
          </TabsContent>
          
          <TabsContent value="home_gallery" className="mt-6">
            <ImageGrid images={homeGalleryImages} category="home_gallery" />
          </TabsContent>
          
          <TabsContent value="social" className="mt-6">
            <ImageGrid images={socialImages} category="social" />
          </TabsContent>
          
          <TabsContent value="favicon" className="mt-6">
            <ImageGrid images={faviconImages} category="favicon" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

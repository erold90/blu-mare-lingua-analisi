
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { imageService, ImageRecord } from '@/services/imageService';

type SiteImageType = 'hero' | 'home_gallery' | 'social' | 'favicon';

interface ImageSection {
  type: SiteImageType;
  title: string;
  description: string;
  maxFiles: number;
  acceptedFormats: string;
  recommendedSize: string;
}

const imageSections: ImageSection[] = [
  {
    type: 'hero',
    title: 'Immagine Hero',
    description: 'Immagine principale della homepage',
    maxFiles: 1,
    acceptedFormats: 'JPG, PNG, WebP',
    recommendedSize: '1920x1080px'
  },
  {
    type: 'home_gallery',
    title: 'Galleria Home',
    description: 'Immagini per la galleria della homepage',
    maxFiles: 10,
    acceptedFormats: 'JPG, PNG, WebP',
    recommendedSize: '1200x800px'
  },
  {
    type: 'social',
    title: 'Immagine Social',
    description: 'Immagine per condivisioni social',
    maxFiles: 1,
    acceptedFormats: 'JPG, PNG',
    recommendedSize: '1200x630px'
  },
  {
    type: 'favicon',
    title: 'Favicon',
    description: 'Icona del sito web',
    maxFiles: 1,
    acceptedFormats: 'PNG, ICO',
    recommendedSize: '32x32px o 64x64px'
  }
];

export const SiteImageSettings: React.FC = () => {
  const [images, setImages] = useState<Record<SiteImageType, ImageRecord[]>>({
    hero: [],
    home_gallery: [],
    social: [],
    favicon: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<SiteImageType | null>(null);

  const loadAllImages = async () => {
    setLoading(true);
    try {
      const [hero, homeGallery, social, favicon] = await Promise.all([
        imageService.getImagesByCategory('hero'),
        imageService.getImagesByCategory('home_gallery'),
        imageService.getImagesByCategory('social'),
        imageService.getImagesByCategory('favicon')
      ]);

      setImages({
        hero,
        home_gallery: homeGallery,
        social,
        favicon
      });
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllImages();
  }, []);

  const handleFileUpload = async (type: SiteImageType, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const section = imageSections.find(s => s.type === type);
    if (!section) return;

    // Controlla il limite di file
    const currentCount = images[type].length;
    const newFilesCount = files.length;
    
    if (currentCount + newFilesCount > section.maxFiles) {
      toast.error(`Puoi caricare massimo ${section.maxFiles} ${section.maxFiles === 1 ? 'immagine' : 'immagini'} per ${section.title}`);
      return;
    }

    setUploading(type);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Validazione del file
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} non è un'immagine valida`);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} è troppo grande (max 10MB)`);
        }

        // Carica l'immagine
        const uploadData = {
          category: type,
          file,
          alt_text: '',
          display_order: currentCount + index,
          is_cover: type !== 'home_gallery' && index === 0 && currentCount === 0
        };

        return await imageService.uploadImage(uploadData);
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r !== null).length;

      if (successCount === files.length) {
        toast.success(`${successCount} ${successCount === 1 ? 'immagine caricata' : 'immagini caricate'} con successo`);
        await loadAllImages();
      } else {
        toast.warning(`${successCount}/${files.length} immagini caricate`);
        await loadAllImages();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Errore nel caricamento: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteImage = async (image: ImageRecord) => {
    if (window.confirm('Sei sicuro di voler eliminare questa immagine?')) {
      const success = await imageService.deleteImage(image.id, image.file_path);
      if (success) {
        await loadAllImages();
        toast.success('Immagine eliminata');
      }
    }
  };

  const handleSetPrimary = async (image: ImageRecord) => {
    try {
      await imageService.updateImage(image.id, { is_cover: true });
      
      // Rimuovi il flag primary dalle altre immagini della stessa categoria
      const otherImages = images[image.category as SiteImageType].filter(img => img.id !== image.id);
      await Promise.all(
        otherImages.map(img => 
          img.is_cover ? imageService.updateImage(img.id, { is_cover: false }) : Promise.resolve()
        )
      );
      
      await loadAllImages();
      toast.success('Immagine principale impostata');
    } catch (error) {
      console.error('Error setting primary:', error);
      toast.error('Errore nell\'impostare l\'immagine principale');
    }
  };

  const handleUpdateAltText = async (image: ImageRecord, newAltText: string) => {
    try {
      await imageService.updateImage(image.id, { alt_text: newAltText });
      await loadAllImages();
      toast.success('Testo alternativo aggiornato');
    } catch (error) {
      console.error('Error updating alt text:', error);
      toast.error('Errore nell\'aggiornamento');
    }
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

  return (
    <div className="space-y-6">
      {imageSections.map((section) => (
        <Card key={section.type}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {section.title}
              <Badge variant="outline">
                {images[section.type].length}/{section.maxFiles}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{section.description}</p>
            <div className="text-xs text-muted-foreground">
              Formati: {section.acceptedFormats} • Dimensioni: {section.recommendedSize}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="text-center">
                <Input
                  type="file"
                  accept="image/*"
                  multiple={section.maxFiles > 1}
                  className="hidden"
                  id={`upload-${section.type}`}
                  onChange={(e) => handleFileUpload(section.type, e.target.files)}
                />
                <Label
                  htmlFor={`upload-${section.type}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm">
                    {uploading === section.type ? 'Caricamento...' : 'Clicca per caricare'}
                  </span>
                </Label>
              </div>
            </div>

            {/* Immagini caricate */}
            {images[section.type].length > 0 && (
              <div className="space-y-3">
                {images[section.type].map((image) => (
                  <div key={image.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={imageService.getImageUrl(image.file_path)}
                          alt={image.alt_text || image.file_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{image.file_name}</span>
                          {image.is_cover && <Badge>Principale</Badge>}
                        </div>
                        <div>
                          <Label className="text-xs">Testo alternativo</Label>
                          <Input
                            value={image.alt_text || ''}
                            onChange={(e) => handleUpdateAltText(image, e.target.value)}
                            placeholder="Descrizione dell'immagine..."
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!image.is_cover && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetPrimary(image)}
                          >
                            <Eye className="h-4 w-4" />
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

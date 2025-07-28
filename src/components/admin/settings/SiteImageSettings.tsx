
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Eye, Plus, Check } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState<Record<SiteImageType, File[]>>({
    hero: [],
    home_gallery: [],
    social: [],
    favicon: []
  });

  const loadAllImages = async () => {
    setLoading(true);
    try {
      console.log('Loading all site images...');
      
      // Timeout per evitare caricamenti infiniti
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading images')), 15000)
      );
      
      const loadPromise = Promise.all([
        imageService.getImagesByCategory('hero'),
        imageService.getImagesByCategory('home_gallery'),
        imageService.getImagesByCategory('social'),
        imageService.getImagesByCategory('favicon')
      ]);
      
      const [hero, homeGallery, social, favicon] = await Promise.race([
        loadPromise,
        timeoutPromise
      ]) as [ImageRecord[], ImageRecord[], ImageRecord[], ImageRecord[]];

      setImages({
        hero,
        home_gallery: homeGallery,
        social,
        favicon
      });
      
      console.log('Site images loaded successfully');
    } catch (error) {
      console.error('Error loading images:', error);
      // Imposta immagini vuote invece di bloccare
      setImages({
        hero: [],
        home_gallery: [],
        social: [],
        favicon: []
      });
      
      if (!error.message?.includes('Timeout')) {
        toast.error('Errore nel caricamento delle immagini');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllImages();
  }, []);

  const handleFileSelection = (type: SiteImageType, files: FileList | null) => {
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

    // Validazione dei file
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} non è un'immagine valida`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} è troppo grande (max 10MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => ({
        ...prev,
        [type]: validFiles
      }));
    }
  };

  const handleUploadToDatabase = async (type: SiteImageType) => {
    const filesToUpload = selectedFiles[type];
    if (filesToUpload.length === 0) return;

    setUploading(type);

    try {
      const currentCount = images[type].length;

      const uploadPromises = filesToUpload.map(async (file, index) => {
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

      if (successCount === filesToUpload.length) {
        toast.success(`${successCount} ${successCount === 1 ? 'immagine caricata' : 'immagini caricate'} con successo`);
        await loadAllImages();
        
        // Clear selected files
        setSelectedFiles(prev => ({
          ...prev,
          [type]: []
        }));
        
        // Update favicon in document if it's a favicon upload
        if (type === 'favicon' && results[0]) {
          const faviconUrl = imageService.getImageUrl(results[0].file_path);
          const imageUtilService = await import('@/utils/image');
          imageUtilService.imageService.updateFavicon(faviconUrl);
        }
        
      } else {
        toast.warning(`${successCount}/${filesToUpload.length} immagini caricate`);
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
                  onChange={(e) => handleFileSelection(section.type, e.target.files)}
                />
                <Label
                  htmlFor={`upload-${section.type}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm">
                    Clicca per selezionare {section.maxFiles > 1 ? 'le immagini' : "l'immagine"}
                  </span>
                </Label>
              </div>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles[section.type].length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {selectedFiles[section.type].length} {selectedFiles[section.type].length === 1 ? 'file selezionato' : 'files selezionati'}
                  </h4>
                  <Button
                    onClick={() => handleUploadToDatabase(section.type)}
                    disabled={uploading === section.type}
                    className="flex items-center gap-2"
                  >
                    {uploading === section.type ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Caricamento...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Carica nel Database
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {selectedFiles[section.type].map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immagini caricate */}
            {images[section.type].length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Immagini nel database</h4>
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

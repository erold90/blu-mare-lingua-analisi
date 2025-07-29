import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Upload, Trash2, Star, Image as ImageIcon, Move, GripVertical, Eye } from 'lucide-react';
import { imageService } from '@/services/image';
import { ImageRecord } from '@/services/image/types';
import { toast } from 'sonner';

export const HomeImageGallery: React.FC = () => {
  const [heroImages, setHeroImages] = useState<ImageRecord[]>([]);
  const [galleryImages, setGalleryImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'gallery'>('hero');

  // Load images for both categories
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const [heroImgs, galleryImgs] = await Promise.all([
        imageService.getImagesByCategory('hero'),
        imageService.getImagesByCategory('home_gallery')
      ]);
      
      setHeroImages(heroImgs);
      setGalleryImages(galleryImgs);
      console.log(`Loaded ${heroImgs.length} hero images and ${galleryImgs.length} gallery images`);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFiles) return;

    setUploading(true);
    try {
      const category = activeTab === 'hero' ? 'hero' : 'home_gallery';
      const existingImages = activeTab === 'hero' ? heroImages : galleryImages;
      
      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        const uploadData = {
          category: category as 'hero' | 'home_gallery',
          file,
          alt_text: `Villa MareBlu - ${category === 'hero' ? 'Hero Image' : 'Gallery Image'} ${existingImages.length + index + 1}`,
          display_order: existingImages.length + index,
          is_cover: category === 'hero' && existingImages.length === 0 // First hero image is cover by default
        };
        
        return await imageService.uploadImage(uploadData);
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r !== null).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} immagini caricate con successo`);
        await loadImages();
        setIsUploadDialogOpen(false);
        setSelectedFiles(null);
        
        // Notify other components about image updates
        window.dispatchEvent(new CustomEvent('homeImagesUpdated'));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const images = activeTab === 'hero' ? heroImages : galleryImages;
    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(sourceIndex, 1);
    reorderedImages.splice(destinationIndex, 0, movedImage);

    // Update local state immediately for better UX
    if (activeTab === 'hero') {
      setHeroImages(reorderedImages);
    } else {
      setGalleryImages(reorderedImages);
    }

    // Prepare updates for database
    const updates = reorderedImages.map((image, index) => ({
      id: image.id,
      display_order: index
    }));

    try {
      await imageService.reorderImages(updates);
      // Notify other components about image updates
      window.dispatchEvent(new CustomEvent('homeImagesUpdated'));
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Errore nel riordinamento');
      // Revert local state on error
      await loadImages();
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (image: ImageRecord) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;

    try {
      await imageService.deleteImage(image.id, image.file_path);
      await loadImages();
      
      // Notify other components about image updates
      window.dispatchEvent(new CustomEvent('homeImagesUpdated'));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Errore nell\'eliminazione dell\'immagine');
    }
  };

  // Handle set cover image (only for hero)
  const handleSetCover = async (image: ImageRecord) => {
    try {
      // For hero images, we don't use apartment_id, so we pass empty string
      await imageService.setCoverImage('', image.id);
      await loadImages();
      
      // Notify other components about image updates
      window.dispatchEvent(new CustomEvent('homeImagesUpdated'));
    } catch (error) {
      console.error('Error setting cover image:', error);
      toast.error('Errore nell\'impostazione dell\'immagine di copertina');
    }
  };

  const currentImages = activeTab === 'hero' ? heroImages : galleryImages;
  const categoryTitle = activeTab === 'hero' ? 'Immagine Hero' : 'Galleria Homepage';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestione Immagini Homepage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'hero' | 'gallery')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Immagine Hero
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Galleria Homepage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Immagine Hero Principale</h3>
                  <p className="text-sm text-muted-foreground">
                    {heroImages.length} immagini caricate • Usa la prima come immagine principale
                  </p>
                </div>
                <Dialog open={isUploadDialogOpen && activeTab === 'hero'} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Carica Immagine Hero
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Carica Immagine Hero</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hero-upload">Seleziona File</Label>
                        <Input
                          id="hero-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setSelectedFiles(e.target.files)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Supporta: JPG, PNG, WEBP. Dimensioni consigliate: 1920x1080px
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button onClick={handleFileUpload} disabled={!selectedFiles || uploading}>
                          {uploading ? 'Caricamento...' : 'Carica'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Galleria Homepage</h3>
                  <p className="text-sm text-muted-foreground">
                    {galleryImages.length} immagini caricate • Trascinale per riordinare
                  </p>
                </div>
                <Dialog open={isUploadDialogOpen && activeTab === 'gallery'} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Carica Immagini Galleria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Carica Immagini Galleria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gallery-upload">Seleziona File</Label>
                        <Input
                          id="gallery-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setSelectedFiles(e.target.files)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Supporta: JPG, PNG, WEBP. Puoi selezionare più file. Dimensioni consigliate: 800x600px
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button onClick={handleFileUpload} disabled={!selectedFiles || uploading}>
                          {uploading ? 'Caricamento...' : 'Carica'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Images Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            {categoryTitle}
            <Badge variant="secondary">{currentImages.length}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Trascina e rilascia per riordinare le immagini
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Caricamento immagini...</p>
            </div>
          ) : currentImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna immagine caricata per {categoryTitle.toLowerCase()}</p>
              <p className="text-sm">Utilizza il pulsante "Carica" per iniziare</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="home-images-gallery">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {currentImages.map((image, index) => (
                      <Draggable key={image.id} draggableId={image.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group bg-white rounded-lg border-2 overflow-hidden transition-all ${
                              snapshot.isDragging ? 'border-primary shadow-lg scale-105 z-50' : 'border-border hover:border-primary/50'
                            } ${image.is_cover ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            {/* Drag Handle */}
                            <div 
                              {...provided.dragHandleProps}
                              className="absolute top-2 left-2 z-10 cursor-move bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            
                            <img
                              src={imageService.getImageUrl(image.file_path)}
                              alt={image.alt_text || 'Immagine homepage'}
                              className="w-full h-32 object-cover"
                            />
                            
                            {/* Cover Badge */}
                            {image.is_cover && activeTab === 'hero' && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-yellow-500 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  Principale
                                </Badge>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {activeTab === 'hero' && !image.is_cover && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSetCover(image)}
                                  className="flex items-center gap-1"
                                >
                                  <Star className="h-3 w-3" />
                                  Principale
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteImage(image)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Elimina
                              </Button>
                            </div>

                            {/* Order Number */}
                            <div className="absolute bottom-2 right-2">
                              <Badge variant="outline" className="bg-white/90">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
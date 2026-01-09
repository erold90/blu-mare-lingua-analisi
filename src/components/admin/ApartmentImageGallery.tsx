import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Upload, Trash2, Star, Image as ImageIcon, Move, GripVertical } from 'lucide-react';
import { apartments } from '@/data/apartments';
import { imageService } from '@/services/image';
import { ImageRecord } from '@/services/image/types';
import { toast } from 'sonner';

export const ApartmentImageGallery: React.FC = () => {
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Load images for selected apartment
  const loadImages = useCallback(async () => {
    if (!selectedApartment) {
      setImages([]);
      return;
    }

    setLoading(true);
    try {
      const apartmentImages = await imageService.getImagesByCategory('apartment', selectedApartment);
      setImages(apartmentImages);
    } catch (error) {
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  }, [selectedApartment]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFiles || !selectedApartment) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        const uploadData = {
          category: 'apartment' as const,
          apartment_id: selectedApartment,
          file,
          alt_text: `${apartments.find(a => a.id === selectedApartment)?.name} - Immagine ${images.length + index + 1}`,
          display_order: images.length + index
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
        window.dispatchEvent(new CustomEvent('apartmentImagesUpdated'));
      }
    } catch (error) {
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

    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(sourceIndex, 1);
    reorderedImages.splice(destinationIndex, 0, movedImage);

    // Update local state immediately for better UX
    setImages(reorderedImages);

    // Prepare updates for database
    const updates = reorderedImages.map((image, index) => ({
      id: image.id,
      display_order: index
    }));

    try {
      await imageService.reorderImages(updates);
      // Notify other components about image updates
      window.dispatchEvent(new CustomEvent('apartmentImagesUpdated'));
    } catch (error) {
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
      window.dispatchEvent(new CustomEvent('apartmentImagesUpdated'));
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'immagine');
    }
  };

  // Handle set cover image
  const handleSetCover = async (image: ImageRecord) => {
    try {
      await imageService.setCoverImage(selectedApartment, image.id);
      await loadImages();
      
      // Notify other components about image updates
      window.dispatchEvent(new CustomEvent('apartmentImagesUpdated'));
    } catch (error) {
      toast.error('Errore nell\'impostazione dell\'immagine di copertina');
    }
  };

  const selectedApartmentName = apartments.find(a => a.id === selectedApartment)?.name || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestione Galleria Immagini Appartamenti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Apartment Selection */}
          <div>
            <Label htmlFor="apartment-select">Seleziona Appartamento</Label>
            <Select value={selectedApartment} onValueChange={setSelectedApartment}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli un appartamento" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map(apartment => (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    {apartment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Button */}
          {selectedApartment && (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{selectedApartmentName}</h3>
                <p className="text-sm text-muted-foreground">
                  {images.length} immagini caricate
                </p>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Carica Immagini
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carica Immagini per {selectedApartmentName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Seleziona File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supporta: JPG, PNG, WEBP. Puoi selezionare più file.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button 
                        onClick={handleFileUpload}
                        disabled={!selectedFiles || uploading}
                      >
                        {uploading ? 'Caricamento...' : 'Carica'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images Gallery */}
      {selectedApartment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Move className="h-5 w-5" />
              Galleria Immagini
              <Badge variant="secondary">{images.length}</Badge>
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
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna immagine caricata per questo appartamento</p>
                <p className="text-sm">Utilizza il pulsante "Carica Immagini" per iniziare</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="images-gallery">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {images.map((image, index) => (
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
                                alt={image.alt_text || 'Immagine appartamento'}
                                className="w-full h-32 object-cover"
                              />
                              
                              {/* Cover Badge */}
                              {image.is_cover && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-yellow-500 text-white">
                                    <Star className="h-3 w-3 mr-1" />
                                    Copertina
                                  </Badge>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!image.is_cover && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetCover(image)}
                                    className="flex items-center gap-1"
                                  >
                                    <Star className="h-3 w-3" />
                                    Copertina
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
      )}
    </div>
  );
};
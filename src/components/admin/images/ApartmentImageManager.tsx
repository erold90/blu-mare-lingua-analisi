
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from './ImageUpload';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Star, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { imageService, ImageRecord } from '@/services/imageService';

interface ApartmentImageManagerProps {
  apartmentId: string;
  apartmentName: string;
}

export const ApartmentImageManager: React.FC<ApartmentImageManagerProps> = ({
  apartmentId,
  apartmentName
}) => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      const apartmentImages = await imageService.getImagesByCategory('apartment', apartmentId);
      setImages(apartmentImages);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [apartmentId]);

  const handleUploadSuccess = () => {
    loadImages();
    setShowUpload(false);
  };

  const handleSetCover = async (imageId: string) => {
    const success = await imageService.setCoverImage(apartmentId, imageId);
    if (success) {
      loadImages();
    }
  };

  const handleDeleteImage = async (image: ImageRecord) => {
    if (window.confirm('Sei sicuro di voler eliminare questa immagine?')) {
      const success = await imageService.deleteImage(image.id, image.file_path);
      if (success) {
        loadImages();
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('Drag end result:', result);
    
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      console.log('Same position, no change needed');
      return;
    }

    console.log(`Moving image from position ${sourceIndex} to ${destinationIndex}`);

    // Create a new array with reordered images
    const newImages = Array.from(images);
    const [reorderedImage] = newImages.splice(sourceIndex, 1);
    newImages.splice(destinationIndex, 0, reorderedImage);

    // Update the local state immediately for better UX
    setImages(newImages);

    // Update display order in database
    const updates = newImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));

    console.log('Updating display orders:', updates);

    try {
      const success = await imageService.reorderImages(updates);
      if (!success) {
        console.error('Failed to update image order, reloading...');
        loadImages();
      } else {
        console.log('Image order updated successfully');
      }
    } catch (error) {
      console.error('Error updating image order:', error);
      loadImages();
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Immagini - {apartmentName}</CardTitle>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            variant={showUpload ? "outline" : "default"}
          >
            {showUpload ? 'Nascondi upload' : 'Carica immagini'}
          </Button>
        </CardHeader>
        <CardContent>
          {showUpload && (
            <ImageUpload
              category="apartment"
              apartmentId={apartmentId}
              onUploadSuccess={handleUploadSuccess}
              maxFiles={20}
              className="mb-6"
            />
          )}

          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna immagine caricata per questo appartamento
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`apartment-images-${apartmentId}`} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                    }`}
                  >
                    {images.map((image, index) => (
                      <Draggable 
                        key={image.id} 
                        draggableId={image.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group transition-all duration-200 ${
                              snapshot.isDragging 
                                ? 'rotate-2 shadow-2xl scale-105 z-50' 
                                : 'hover:shadow-lg'
                            }`}
                          >
                            <Card className="overflow-hidden border-2 border-transparent hover:border-blue-200 transition-colors relative">
                              {/* Drag Handle - posizionato in modo prominente */}
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 left-2 z-20 p-2 rounded-md bg-black/70 cursor-grab active:cursor-grabbing opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <GripVertical className="h-4 w-4 text-white" />
                              </div>

                              <div className="relative aspect-video">
                                <img
                                  src={imageService.getImageUrl(image.file_path)}
                                  alt={image.alt_text || `Immagine ${index + 1}`}
                                  className="w-full h-full object-cover select-none"
                                  draggable={false}
                                />
                                {image.is_cover && (
                                  <Badge className="absolute top-2 right-2 bg-yellow-500 z-10">
                                    Copertina
                                  </Badge>
                                )}
                                
                                {/* Action buttons - visibili solo on hover e non durante il drag */}
                                <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 ${
                                  snapshot.isDragging 
                                    ? 'opacity-0 pointer-events-none' 
                                    : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetCover(image.id);
                                    }}
                                    disabled={image.is_cover}
                                    className="z-10"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteImage(image);
                                    }}
                                    className="z-10"
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
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {image.alt_text}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ordine: {image.display_order}
                                </p>
                              </CardContent>
                            </Card>
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

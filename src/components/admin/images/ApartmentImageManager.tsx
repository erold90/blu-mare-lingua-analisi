
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from './ImageUpload';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newImages = Array.from(images);
    const [reorderedImage] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, reorderedImage);

    setImages(newImages);

    // Update display order in database
    const updates = newImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));

    await imageService.reorderImages(updates);
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
              <Droppable droppableId="apartment-images">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {images.map((image, index) => (
                      <Draggable key={image.id} draggableId={image.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative group"
                          >
                            <Card className="overflow-hidden">
                              <div className="relative aspect-video">
                                <img
                                  src={imageService.getImageUrl(image.file_path)}
                                  alt={image.alt_text || `Immagine ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {image.is_cover && (
                                  <Badge className="absolute top-2 left-2">
                                    Copertina
                                  </Badge>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetCover(image.id)}
                                    disabled={image.is_cover}
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteImage(image)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 right-2 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <GripVertical className="h-4 w-4 text-white" />
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


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUpload } from './ImageUpload';
import { ImageGrid } from './ImageGrid';
import { DropResult } from '@hello-pangea/dnd';
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
      console.log('Loaded images:', apartmentImages);
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
        toast.error('Errore nel riordinare le immagini');
        loadImages();
      } else {
        console.log('Image order updated successfully');
        toast.success('Ordine immagini aggiornato');
      }
    } catch (error) {
      console.error('Error updating image order:', error);
      toast.error('Errore nel riordinare le immagini');
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

          <ImageGrid
            images={images}
            apartmentId={apartmentId}
            onDragEnd={handleDragEnd}
            onSetCover={handleSetCover}
            onDelete={handleDeleteImage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

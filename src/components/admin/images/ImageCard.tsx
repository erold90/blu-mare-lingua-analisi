
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { ImageActions } from './ImageActions';
import { imageService, ImageRecord } from '@/services/imageService';

interface ImageCardProps {
  image: ImageRecord;
  index: number;
  isDragging: boolean;
  dragHandleProps: any;
  onSetCover: (imageId: string) => void;
  onDelete: (image: ImageRecord) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  isDragging,
  dragHandleProps,
  onSetCover,
  onDelete
}) => {
  return (
    <Card className="overflow-hidden border-2 border-transparent hover:border-blue-200 transition-colors relative group">
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 left-2 z-30 p-1 rounded-md bg-white/90 cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100 transition-opacity shadow-sm"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="h-4 w-4 text-gray-600" />
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
        
        <ImageActions
          image={image}
          isDragging={isDragging}
          onSetCover={onSetCover}
          onDelete={onDelete}
        />
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
      </CardContent>
    </Card>
  );
};

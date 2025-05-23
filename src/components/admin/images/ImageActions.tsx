
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { ImageRecord } from '@/services/imageService';

interface ImageActionsProps {
  image: ImageRecord;
  isDragging: boolean;
  onSetCover: (imageId: string) => void;
  onDelete: (image: ImageRecord) => void;
}

export const ImageActions: React.FC<ImageActionsProps> = ({
  image,
  isDragging,
  onSetCover,
  onDelete
}) => {
  return (
    <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 ${
      isDragging 
        ? 'opacity-0 pointer-events-none' 
        : 'opacity-0 group-hover:opacity-100'
    }`}>
      <Button
        size="sm"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          onSetCover(image.id);
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
          onDelete(image);
        }}
        className="z-10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

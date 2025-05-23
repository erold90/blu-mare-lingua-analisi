
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ImageCard } from './ImageCard';
import { ImageRecord } from '@/services/imageService';

interface ImageGridProps {
  images: ImageRecord[];
  apartmentId: string;
  onDragEnd: (result: DropResult) => void;
  onSetCover: (imageId: string) => void;
  onDelete: (image: ImageRecord) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  apartmentId,
  onDragEnd,
  onSetCover,
  onDelete
}) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessuna immagine caricata per questo appartamento
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                    <ImageCard
                      image={image}
                      index={index}
                      isDragging={snapshot.isDragging}
                      dragHandleProps={provided.dragHandleProps}
                      onSetCover={onSetCover}
                      onDelete={onDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

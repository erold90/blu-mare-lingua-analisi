
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { FileWithAltText } from '../types';

interface FilePreviewProps {
  fileData: FileWithAltText;
  fileIndex: number;
  onRemove: (index: number) => void;
  onAltTextChange: (index: number, value: string) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileData,
  fileIndex,
  onRemove,
  onAltTextChange
}) => {
  return (
    <div className="flex items-start gap-4 p-3 border rounded-lg">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <img
            src={fileData.preview}
            alt={`Preview ${fileIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <div className="mt-2">
          <Label htmlFor={`alt-text-${fileIndex}`} className="text-xs">
            Testo alternativo (opzionale)
          </Label>
          <Input
            id={`alt-text-${fileIndex}`}
            value={fileData.altText}
            onChange={(e) => onAltTextChange(fileIndex, e.target.value)}
            placeholder="Descrizione dell'immagine..."
            className="mt-1 text-sm"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(fileIndex)}
        className="flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

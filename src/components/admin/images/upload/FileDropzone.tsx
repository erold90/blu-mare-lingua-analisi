
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  maxFiles: number;
  multiple: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onDrop,
  maxFiles,
  multiple
}) => {
  console.log('FileDropzone rendered with props:', { maxFiles, multiple });

  const handleDrop = (acceptedFiles: File[]) => {
    console.log('FileDropzone - handleDrop called with files:', acceptedFiles);
    onDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    multiple,
    noClick: false
  });

  const handleClick = (e: React.MouseEvent) => {
    console.log('FileDropzone - Click detected');
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  console.log('FileDropzone - Current state:', { isDragActive });

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
      {isDragActive ? (
        <p className="text-primary">Rilascia le immagini qui...</p>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Trascina le immagini qui o clicca per selezionare
          </p>
          <p className="text-xs text-muted-foreground">
            Formati supportati: JPEG, PNG, WebP, GIF (max 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

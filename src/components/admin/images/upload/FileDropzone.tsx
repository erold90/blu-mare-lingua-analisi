
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
  console.log('🔥 FileDropzone rendered with props:', { maxFiles, multiple });

  const handleDrop = (acceptedFiles: File[]) => {
    console.log('🔥🔥🔥 DROPZONE - handleDrop called with files:', acceptedFiles.map(f => f.name));
    onDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    multiple,
    noClick: false,
    noKeyboard: false,
    onDropAccepted: (files) => {
      console.log('🔥 Files accepted:', files.length);
    },
    onDropRejected: (rejectedFiles) => {
      console.log('🔥 Files rejected:', rejectedFiles);
    },
    onFileDialogOpen: () => {
      console.log('🔥🔥🔥 FILE DIALOG OPENED!!!');
    },
    onFileDialogCancel: () => {
      console.log('🔥 File dialog cancelled');
    }
  });

  console.log('🔥 FileDropzone - Current state:', { isDragActive });

  const rootProps = getRootProps();
  const inputProps = getInputProps();

  console.log('🔥 Root props:', Object.keys(rootProps));
  console.log('🔥 Input props:', Object.keys(inputProps));

  const handleManualClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('🔥🔥🔥 MANUAL CLICK DETECTED!!! Event:', e.type);
    if (rootProps.onClick) {
      console.log('🔥 Calling rootProps.onClick');
      rootProps.onClick(e);
    } else {
      console.log('🔥 No rootProps.onClick, calling open() directly');
      open();
    }
  };

  return (
    <div
      {...rootProps}
      onClick={handleManualClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input {...inputProps} />
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

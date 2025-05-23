
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { imageService, ImageCategory } from '@/services/imageService';
import { FileDropzone } from './upload/FileDropzone';
import { FilePreview } from './upload/FilePreview';
import { UploadErrors } from './upload/UploadErrors';
import { useImageUpload } from './upload/useImageUpload';

interface ImageUploadProps {
  category: ImageCategory;
  apartmentId?: string;
  onUploadSuccess?: () => void;
  maxFiles?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  category,
  apartmentId,
  onUploadSuccess,
  maxFiles = 10,
  className = ""
}) => {
  const {
    filesWithAltText,
    uploading,
    uploadErrors,
    handleDrop,
    removeFile,
    handleAltTextChange,
    handleUpload
  } = useImageUpload({
    category,
    apartmentId,
    onUploadSuccess,
    maxFiles
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="pt-6">
          <FileDropzone 
            onDrop={handleDrop}
            maxFiles={maxFiles}
            multiple={maxFiles > 1}
          />
        </CardContent>
      </Card>

      <UploadErrors errors={uploadErrors} />

      {filesWithAltText.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Immagini selezionate ({filesWithAltText.length})</h3>
            <div className="space-y-4">
              {filesWithAltText.map((fileData, fileIndex) => (
                <FilePreview
                  key={`file-${fileIndex}`}
                  fileData={fileData}
                  fileIndex={fileIndex}
                  onRemove={removeFile}
                  onAltTextChange={handleAltTextChange}
                />
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Caricamento...' : `Carica ${filesWithAltText.length} immagini`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


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
  console.log('=== ImageUpload Component Rendered ===');
  console.log('ImageUpload props:', { category, apartmentId, maxFiles, className });

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

  console.log('ImageUpload state:', { 
    filesCount: filesWithAltText.length, 
    uploading, 
    errorsCount: uploadErrors.length 
  });

  const handleDropWrapper = (files: File[]) => {
    console.log('ImageUpload - handleDropWrapper called with:', files);
    handleDrop(files);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="pt-6">
          <FileDropzone 
            onDrop={handleDropWrapper}
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
              <Button 
                onClick={() => {
                  console.log('Upload button clicked!');
                  handleUpload();
                }} 
                disabled={uploading}
                className="min-w-[120px]"
              >
                {uploading ? 'Caricamento...' : `Carica ${filesWithAltText.length} ${filesWithAltText.length === 1 ? 'immagine' : 'immagini'}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

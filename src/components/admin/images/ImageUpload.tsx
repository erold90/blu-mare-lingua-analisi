
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageCategory } from '@/services/imageService';

interface ImageUploadProps {
  category: ImageCategory;
  apartmentId?: string;
  onUploadSuccess?: () => void;
  maxFiles?: number;
  className?: string;
}

interface FileWithAltText {
  file: File;
  altText: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  category,
  apartmentId,
  onUploadSuccess,
  maxFiles = 10,
  className = ""
}) => {
  const [filesWithAltText, setFilesWithAltText] = React.useState<FileWithAltText[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} non è un'immagine valida`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} è troppo grande (max 10MB)`);
        return false;
      }
      return true;
    });

    const newFilesWithAltText = validFiles.map(file => ({
      file,
      altText: ''
    }));

    setFilesWithAltText(prev => [...prev, ...newFilesWithAltText].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    multiple: maxFiles > 1
  });

  const removeFile = (fileIndex: number) => {
    setFilesWithAltText(prev => prev.filter((_, i) => i !== fileIndex));
  };

  const handleAltTextChange = (fileIndex: number, value: string) => {
    setFilesWithAltText(prev => 
      prev.map((item, i) => 
        i === fileIndex ? { ...item, altText: value } : item
      )
    );
  };

  const handleUpload = async () => {
    if (filesWithAltText.length === 0) {
      toast.error("Seleziona almeno un'immagine");
      return;
    }

    setUploading(true);
    
    try {
      const { imageService } = await import('@/services/imageService');
      
      const uploadPromises = filesWithAltText.map((fileData, arrayIndex) => {
        const displayOrder = Number(arrayIndex); // Assicuriamoci che sia un numero
        return imageService.uploadImage({
          category,
          apartment_id: apartmentId,
          file: fileData.file,
          alt_text: fileData.altText || '',
          display_order: displayOrder
        });
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(result => result !== null).length;
      
      if (successCount === filesWithAltText.length) {
        toast.success(`${successCount} immagini caricate con successo`);
        setFilesWithAltText([]);
        onUploadSuccess?.();
      } else {
        toast.warning(`${successCount}/${filesWithAltText.length} immagini caricate`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Errore nel caricamento delle immagini");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
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
        </CardContent>
      </Card>

      {filesWithAltText.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Immagini selezionate ({filesWithAltText.length})</h3>
            <div className="space-y-4">
              {filesWithAltText.map((fileData, fileIndex) => (
                <div key={`file-${fileIndex}`} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
                        onChange={(e) => handleAltTextChange(fileIndex, e.target.value)}
                        placeholder="Descrizione dell'immagine..."
                        className="mt-1"
                        size="sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileIndex)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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

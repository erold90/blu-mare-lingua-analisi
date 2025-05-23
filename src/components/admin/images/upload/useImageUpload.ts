
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { imageService, ImageCategory } from '@/services/imageService';
import { FileWithAltText } from '../types';

interface UseImageUploadProps {
  category: ImageCategory;
  apartmentId?: string;
  onUploadSuccess?: () => void;
  maxFiles: number;
}

export const useImageUpload = ({
  category,
  apartmentId,
  onUploadSuccess,
  maxFiles
}: UseImageUploadProps) => {
  const [filesWithAltText, setFilesWithAltText] = useState<FileWithAltText[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      filesWithAltText.forEach(fileData => {
        URL.revokeObjectURL(fileData.preview);
      });
    };
  }, [filesWithAltText]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    
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

    console.log("Valid files:", validFiles);

    const newFilesWithAltText = validFiles.map(file => ({
      file,
      altText: '',
      preview: URL.createObjectURL(file)
    }));

    setFilesWithAltText(prev => [...prev, ...newFilesWithAltText].slice(0, maxFiles));
    setUploadErrors([]); // Clear previous errors
  }, [maxFiles]);

  const removeFile = (fileIndex: number) => {
    setFilesWithAltText(prev => {
      const fileToRemove = prev[fileIndex];
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((_, i) => i !== fileIndex);
    });
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

    console.log("Starting upload process for", filesWithAltText.length, "files");
    setUploading(true);
    setUploadErrors([]);
    
    try {
      console.log("Image service loaded, starting uploads...");
      
      // Upload files sequentially to avoid conflicts with simultaneous uploads
      const results = [];
      const errors = [];
      
      for (let index = 0; index < filesWithAltText.length; index++) {
        const fileData = filesWithAltText[index];
        const displayOrder = Number(index);
        
        console.log(`Uploading file ${index + 1}/${filesWithAltText.length}:`, fileData.file.name);
        
        try {
          // Add a small delay between uploads to ensure unique timestamps
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const result = await imageService.uploadImage({
            category,
            apartment_id: apartmentId,
            file: fileData.file,
            alt_text: fileData.altText || '',
            display_order: displayOrder
          });
          
          if (result) {
            console.log(`Upload successful for ${fileData.file.name}:`, result);
            results.push(result);
          } else {
            console.error(`Upload failed for ${fileData.file.name}`);
            errors.push(`Errore caricamento: ${fileData.file.name}`);
          }
        } catch (error) {
          console.error(`Error uploading ${fileData.file.name}:`, error);
          errors.push(`Errore caricamento: ${fileData.file.name}`);
        }
      }
      
      const successCount = results.length;
      
      console.log("Upload results:", {
        total: filesWithAltText.length,
        successful: successCount,
        failed: errors.length
      });
      
      if (successCount === filesWithAltText.length) {
        toast.success(`${successCount} immagini caricate con successo`);
        // Cleanup object URLs before clearing
        filesWithAltText.forEach(fileData => {
          URL.revokeObjectURL(fileData.preview);
        });
        setFilesWithAltText([]);
        onUploadSuccess?.();
      } else if (successCount > 0) {
        toast.warning(`${successCount}/${filesWithAltText.length} immagini caricate`);
        setUploadErrors(errors);
      } else {
        toast.error("Nessuna immagine è stata caricata");
        setUploadErrors(errors);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Errore nel caricamento delle immagini");
      setUploadErrors(["Errore generale nel sistema di caricamento"]);
    } finally {
      setUploading(false);
    }
  };

  return {
    filesWithAltText,
    uploading,
    uploadErrors,
    handleDrop,
    removeFile,
    handleAltTextChange,
    handleUpload
  };
};

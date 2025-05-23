
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
  console.log('🔥 useImageUpload hook initialized with:', { category, apartmentId, maxFiles });
  
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
    console.log("🔥🔥🔥 FILES DROPPED - useImageUpload handleDrop called! 🔥🔥🔥");
    console.log("🔥 acceptedFiles:", acceptedFiles);
    console.log("🔥 acceptedFiles length:", acceptedFiles.length);
    console.log("🔥 Files details:", acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    if (acceptedFiles.length === 0) {
      console.log("🔥 No files accepted - probably wrong format or size");
      return;
    }
    
    const validFiles = acceptedFiles.filter(file => {
      console.log(`🔥 Validating file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      if (!file.type.startsWith('image/')) {
        console.log(`🔥 Invalid file type for ${file.name}: ${file.type}`);
        toast.error(`${file.name} non è un'immagine valida`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        console.log(`🔥 File too large: ${file.name}, size: ${file.size}`);
        toast.error(`${file.name} è troppo grande (max 10MB)`);
        return false;
      }
      console.log(`🔥 File ${file.name} is valid`);
      return true;
    });

    console.log("🔥 Valid files after filtering:", validFiles.map(f => ({ name: f.name, size: f.size })));

    if (validFiles.length === 0) {
      console.log("🔥 No valid files after filtering");
      return;
    }

    const newFilesWithAltText = validFiles.map(file => {
      const preview = URL.createObjectURL(file);
      console.log(`🔥 Created preview URL for ${file.name}: ${preview}`);
      return {
        file,
        altText: '',
        preview
      };
    });

    console.log("🔥 New files with alt text created:", newFilesWithAltText.length);

    setFilesWithAltText(prev => {
      const updated = [...prev, ...newFilesWithAltText].slice(0, maxFiles);
      console.log("🔥 Updated filesWithAltText, new length:", updated.length);
      return updated;
    });
    setUploadErrors([]); // Clear previous errors
    
    console.log("🔥 handleDrop completed successfully");
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

    console.log("=== STARTING UPLOAD PROCESS ===");
    console.log("Upload parameters:", { 
      category, 
      apartmentId, 
      fileCount: filesWithAltText.length,
      maxFiles 
    });
    
    setUploading(true);
    setUploadErrors([]);
    
    try {
      console.log("Image service available:", !!imageService);
      
      // Upload files sequentially to avoid conflicts with simultaneous uploads
      const results = [];
      const errors = [];
      
      for (let index = 0; index < filesWithAltText.length; index++) {
        const fileData = filesWithAltText[index];
        const displayOrder = Number(index);
        
        console.log(`=== UPLOADING FILE ${index + 1}/${filesWithAltText.length} ===`);
        console.log("File details:", {
          name: fileData.file.name,
          size: fileData.file.size,
          type: fileData.file.type,
          category,
          apartmentId,
          displayOrder
        });
        
        try {
          // Add a small delay between uploads to ensure unique timestamps
          if (index > 0) {
            console.log("Adding delay between uploads...");
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Per le immagini del sito, assicuriamoci che is_cover sia impostato correttamente
          const isCoverImage = category !== 'apartment' && index === 0;
          
          const uploadData = {
            category,
            file: fileData.file,
            alt_text: fileData.altText || '',
            display_order: displayOrder,
            is_cover: isCoverImage,
            ...(apartmentId && { apartment_id: apartmentId })
          };
          
          console.log('Final upload data:', uploadData);
          
          const result = await imageService.uploadImage(uploadData);
          
          if (result) {
            console.log(`✅ Upload successful for ${fileData.file.name}:`, result);
            results.push(result);
          } else {
            console.error(`❌ Upload failed for ${fileData.file.name} - result is null`);
            errors.push(`Errore caricamento: ${fileData.file.name} - Nessun risultato dal server`);
          }
        } catch (error) {
          console.error(`❌ Error uploading ${fileData.file.name}:`, error);
          errors.push(`Errore caricamento: ${fileData.file.name} - ${error.message || 'Errore sconosciuto'}`);
        }
      }
      
      const successCount = results.length;
      
      console.log("=== UPLOAD PROCESS COMPLETED ===");
      console.log("Upload summary:", {
        total: filesWithAltText.length,
        successful: successCount,
        failed: errors.length,
        category,
        apartmentId
      });
      
      if (successCount === filesWithAltText.length) {
        toast.success(`${successCount} immagini caricate con successo`);
        // Cleanup object URLs before clearing
        filesWithAltText.forEach(fileData => {
          URL.revokeObjectURL(fileData.preview);
        });
        setFilesWithAltText([]);
        
        // Call the success callback
        if (onUploadSuccess) {
          console.log('✅ Calling onUploadSuccess callback');
          try {
            await onUploadSuccess();
            console.log('✅ onUploadSuccess callback completed');
          } catch (callbackError) {
            console.error('❌ Error in onUploadSuccess callback:', callbackError);
          }
        } else {
          console.log('ℹ️ No onUploadSuccess callback provided');
        }
      } else if (successCount > 0) {
        toast.warning(`${successCount}/${filesWithAltText.length} immagini caricate`);
        setUploadErrors(errors);
        
        // Call the success callback even for partial success
        if (onUploadSuccess) {
          console.log('⚠️ Calling onUploadSuccess callback (partial success)');
          try {
            await onUploadSuccess();
            console.log('✅ onUploadSuccess callback completed (partial)');
          } catch (callbackError) {
            console.error('❌ Error in onUploadSuccess callback (partial):', callbackError);
          }
        }
      } else {
        toast.error("Nessuna immagine è stata caricata");
        setUploadErrors(errors);
      }
    } catch (error) {
      console.error('=== UPLOAD PROCESS FAILED ===');
      console.error('General upload error:', error);
      toast.error("Errore nel caricamento delle immagini");
      setUploadErrors([`Errore generale nel sistema di caricamento: ${error.message || 'Errore sconosciuto'}`]);
    } finally {
      setUploading(false);
      console.log("=== UPLOAD PROCESS ENDED ===");
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

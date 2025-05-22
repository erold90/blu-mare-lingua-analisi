import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Camera, X, Move, CheckCircle, ImageIcon, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { saveImage, getImage } from "@/utils/imageStorage";
import { deleteImageEverywhere, syncImageToServer } from "@/utils/imageManager";

interface ApartmentImagesProps {
  apartmentId: string;
  images: string[];
  coverImageIndex: number | undefined;
  onImagesChange: (apartmentId: string, images: string[]) => void;
  onCoverImageChange: (apartmentId: string, index: number) => void;
}

export const ApartmentImages: React.FC<ApartmentImagesProps> = ({
  apartmentId,
  images,
  coverImageIndex,
  onImagesChange,
  onCoverImageChange,
}) => {
  const isMobile = useIsMobile();
  const [loadedImages, setLoadedImages] = useState<{[key: string]: string}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load all images on component mount
  useEffect(() => {
    const loadAllImages = async () => {
      // Initialize loading states
      const initialLoadingStates: {[key: string]: boolean} = {};
      images.forEach(path => {
        initialLoadingStates[path] = true;
      });
      setLoadingStates(initialLoadingStates);
      
      // Load each image
      const imageData: {[key: string]: string} = {};
      
      for (const path of images) {
        if (path.startsWith('/upload/')) {
          try {
            // Try local storage first
            const storedImage = await getImage(path);
            
            if (storedImage && storedImage.data) {
              imageData[path] = storedImage.data;
            } else {
              // Try cloud storage as fallback
              try {
                const cloudData = await loadImageFromCloud(path);
                if (cloudData) {
                  imageData[path] = cloudData;
                  
                  // Save to IndexedDB for future use
                  try {
                    const imageObj = {
                      path,
                      data: cloudData,
                      category: 'home', // Default category for apartment images
                      fileName: path.split('_').slice(2).join('_'),
                      createdAt: parseInt(path.split('_')[1]) || Date.now(),
                      id: path.split('_')[1] || Date.now().toString()
                    };
                    
                    const db = await openIndexedDB();
                    const tx = db.transaction(['images'], 'readwrite');
                    const store = tx.objectStore('images');
                    store.put(imageObj);
                    
                    tx.oncomplete = () => {
                      db.close();
                      console.log(`Image ${path} saved to IndexedDB from cloud`);
                    };
                  } catch (err) {
                    console.error('Error saving cloud image to IndexedDB:', err);
                  }
                }
              } catch (cloudError) {
                console.error(`Error loading image ${path} from cloud:`, cloudError);
              }
            }
          } catch (error) {
            console.error(`Error loading image ${path}:`, error);
          }
        } else {
          imageData[path] = path;
        }
        
        // Update loading state for this image
        setLoadingStates(prev => ({
          ...prev,
          [path]: false
        }));
      }
      
      setLoadedImages(imageData);
    };
    
    loadAllImages();
  }, [images]);
  
  // Opens the IndexedDB database
  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('villaMarePluImages', 1);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'path' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onImagesChange(apartmentId, items);
    
    // If the cover image was moved, update its index
    if (coverImageIndex === result.source.index) {
      onCoverImageChange(apartmentId, result.destination.index);
    }
    
    toast.success("Ordine immagini aggiornato");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImage(true);
    setUploadProgress(0);
    
    // Create an array to store new image paths
    const newImagePaths: string[] = [];
    
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Calculate percentage progress for this file
        const fileProgress = (i) / e.target.files.length * 100;
        setUploadProgress(fileProgress);
        
        // Save image to IndexedDB
        const imagePath = await saveImage(
          file,
          'home', // Using 'home' for apartments too since it's the same image type
          (progress) => {
            // Convert individual file progress to overall progress
            const fileWeight = 100 / e.target.files.length;
            const overallProgress = fileProgress + (progress / 100 * fileWeight);
            setUploadProgress(Math.min(overallProgress, 99));
          }
        );
        
        // Sync to server with automatic organization
        await syncImageToServer(imagePath);
        
        newImagePaths.push(imagePath);
        
        // Load the image immediately
        const imageData = await getImage(imagePath);
        if (imageData && imageData.data) {
          setLoadedImages(prev => ({
            ...prev,
            [imagePath]: imageData.data
          }));
        }
      }
      
      // Update apartment images with the new paths
      onImagesChange(apartmentId, [...images, ...newImagePaths]);
      
      // Set the first image as cover if no cover is set
      if (coverImageIndex === undefined && newImagePaths.length > 0 && images.length === 0) {
        onCoverImageChange(apartmentId, 0);
      }
      
      setUploadProgress(100);
      toast.success(`${newImagePaths.length} immagini caricate`);
    } catch (error) {
      console.error('Error uploading apartment images:', error);
      toast.error(`Errore durante il caricamento delle immagini: ${(error as Error).message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    // Create a new array without this image
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(apartmentId, updatedImages);
    
    // Adjust cover image index if needed
    if (coverImageIndex === index) {
      // If we removed the cover image, set the first image as cover or clear it
      onCoverImageChange(apartmentId, updatedImages.length > 0 ? 0 : -1);
    } else if (coverImageIndex !== undefined && coverImageIndex > index) {
      // If we removed an image before the cover, adjust the index
      onCoverImageChange(apartmentId, coverImageIndex - 1);
    }
    
    // Delete the image from both local storage and server
    if (imageToRemove.startsWith('/upload/')) {
      try {
        await deleteImageEverywhere(imageToRemove);
        toast.success("Immagine rimossa dal server");
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error("Errore durante l'eliminazione dell'immagine dal server");
      }
    }
    
    toast.success("Immagine rimossa");
  };

  // Get image data for display
  const getImageData = (path: string): string => {
    return loadedImages[path] || path;
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini ({images.length})</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
            className="flex items-center"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Aggiungi
          </Button>
          <Input 
            id={`file-upload-${apartmentId}`}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </div>
      </div>
      
      {uploadingImage && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Caricamento in corso...</p>
        </div>
      )}
      
      {images.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="apartment-images" direction={isMobile ? "vertical" : "horizontal"}>
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {images.map((imagePath, index) => (
                  <Draggable key={`${apartmentId}-${index}`} draggableId={`${apartmentId}-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative rounded-md overflow-hidden border ${
                          coverImageIndex === index ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="aspect-square relative">
                          {loadingStates[imagePath] ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <img 
                              src={getImageData(imagePath)} 
                              alt={`Apartment ${index+1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              onLoad={() => {
                                setLoadingStates(prev => ({
                                  ...prev,
                                  [imagePath]: false
                                }));
                              }}
                              onError={(e) => {
                                console.error(`Failed to load image: ${imagePath}`);
                                e.currentTarget.src = "/placeholder.svg";
                                setLoadingStates(prev => ({
                                  ...prev,
                                  [imagePath]: false
                                }));
                              }}
                            />
                          )}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-white/80 hover:bg-white"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-white/80 hover:bg-white"
                            onClick={() => onCoverImageChange(apartmentId, index)}
                          >
                            <CheckCircle className={`h-3 w-3 ${coverImageIndex === index ? 'text-primary' : ''}`} />
                          </Button>
                          <div
                            {...provided.dragHandleProps}
                            className="h-6 w-6 flex items-center justify-center bg-white/80 hover:bg-white rounded-sm cursor-move"
                          >
                            <Move className="h-3 w-3" />
                          </div>
                        </div>
                        {coverImageIndex === index && (
                          <Badge className="absolute bottom-1 left-1">Cover</Badge>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">
            Nessuna immagine caricata
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
          >
            <Camera className="h-4 w-4 mr-2" /> Carica immagini
          </Button>
        </div>
      )}
    </div>
  );
};

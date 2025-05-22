import { toast } from "sonner";

// Define types for our image storage
export interface StoredImage {
  id: string;
  path: string;
  data: string; // base64 data
  category: ImageCategory;
  fileName: string;
  createdAt: number;
}

export type ImageCategory = 'hero' | 'home' | 'social' | 'favicon';

// IndexedDB configuration
const DB_NAME = 'villaMareBluImages';
const STORE_NAME = 'images';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Converts a file to base64 format
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Optimizes an image by resizing it to a maximum width
 */
export const optimizeImage = async (file: File, maxWidth = 1920): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // If the image is already smaller than the maximum, don't resize
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        blob => {
          if (blob) {
            // Convert Blob to File
            const optimizedFile = new File(
              [blob], 
              file.name, 
              { 
                type: file.type,
                lastModified: new Date().getTime()
              }
            );
            resolve(optimizedFile);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        file.type,
        0.85 // Image quality (85%)
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for optimization"));
    };
    
    img.src = url;
  });
};

/**
 * Saves an image to IndexedDB
 */
export const saveImage = async (
  file: File, 
  category: ImageCategory, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Il file selezionato non è un\'immagine valida');
    }
    
    // Report initial progress
    onProgress?.(10);
    
    // Optimize the image
    console.log(`Ottimizzazione immagine ${category}: ${file.name}`);
    const optimizedFile = await optimizeImage(file);
    
    // Report progress after optimization
    onProgress?.(40);
    
    // Generate a unique path for this image
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const safeFileName = file.name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
      
    const path = `/upload/${category}_${timestamp}_${safeFileName}`;
    
    // Convert image to base64
    const base64Data = await fileToBase64(optimizedFile);
    
    // Report progress after base64 conversion
    onProgress?.(70);
    
    // Save to IndexedDB
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const imageData: StoredImage = {
        id: `${timestamp}`,
        path,
        data: base64Data,
        category,
        fileName: file.name,
        createdAt: timestamp
      };
      
      const request = store.put(imageData);
      
      request.onerror = () => {
        console.error('Error saving image to IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log(`Immagine ${category} salvata con successo:`, path);
        onProgress?.(100);
        resolve(path);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error saving ${category} image:`, error);
    throw error;
  }
};

/**
 * Retrieves an image from IndexedDB by its path
 */
export const getImage = async (path: string): Promise<StoredImage | null> => {
  if (!path.startsWith('/upload/')) {
    // Not a stored image, return null
    return null;
  }
  
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return null;
  }
};

/**
 * Gets images by category
 */
export const getImagesByCategory = async (category: ImageCategory): Promise<StoredImage[]> => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const images = request.result as StoredImage[];
        // Sort by createdAt, newest first
        images.sort((a, b) => b.createdAt - a.createdAt);
        resolve(images);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error retrieving images by category:', error);
    return [];
  }
};

/**
 * Deletes an image from IndexedDB by its path
 */
export const deleteImage = async (path: string): Promise<boolean> => {
  if (!path.startsWith('/upload/')) {
    return false;
  }
  
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(path);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Prunes old images to manage storage size
 */
export const pruneOldImages = async (maxImages: number = 200): Promise<void> => {
  try {
    const db = await openDatabase();
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    
    countRequest.onsuccess = async () => {
      const totalCount = countRequest.result;
      
      if (totalCount <= maxImages) {
        return;
      }
      
      // Get all images sorted by date
      const index = store.index('createdAt');
      const request = index.getAll();
      
      request.onsuccess = async () => {
        const images = request.result as StoredImage[];
        images.sort((a, b) => a.createdAt - b.createdAt); // Oldest first
        
        // Keep essential images (hero, favicon) and newer ones
        const toDelete = images.slice(0, totalCount - maxImages);
        
        // Delete old images
        for (const image of toDelete) {
          // Don't delete hero or favicon images
          if (image.category === 'hero' || image.category === 'favicon') {
            continue;
          }
          
          await deleteImage(image.path);
        }
        
        console.log(`Pruned ${toDelete.length} old images`);
      };
    };
  } catch (error) {
    console.error('Error pruning old images:', error);
  }
};

/**
 * Gets the total size of images stored in IndexedDB
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const images = request.result as StoredImage[];
        const totalSize = images.reduce((size, img) => size + (img.data?.length || 0), 0);
        resolve(totalSize);
      };
      
      request.onerror = () => {
        resolve(0);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
};

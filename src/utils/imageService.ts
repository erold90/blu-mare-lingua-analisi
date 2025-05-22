
import { toast } from "sonner";

// Costanti di configurazione
const API_BASE_URL = "/api/images.php";
const IMAGE_CATEGORIES = {
  APARTMENTS: "appartamenti",
  HERO: "hero",
  SOCIAL: "social",
  FAVICON: "favicon"
} as const;

// Tipi di dati
export type ImageCategory = typeof IMAGE_CATEGORIES[keyof typeof IMAGE_CATEGORIES];

export interface ImageMetadata {
  id: string;
  path: string;
  originalName: string;
  category: ImageCategory;
  timestamp: number;
  size: number;
  width?: number;
  height?: number;
  apartmentId?: string;
  isCover?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  message: string;
  metadata?: ImageMetadata;
}

export interface ImageListResult {
  success: boolean;
  message: string;
  images: ImageMetadata[];
}

export interface ImageDeleteResult {
  success: boolean;
  message: string;
  id: string;
}

/**
 * Servizio completo per la gestione delle immagini
 */
class ImageService {
  /**
   * Carica un'immagine sul server
   */
  async uploadImage(
    file: File, 
    category: ImageCategory, 
    additionalData: { apartmentId?: string; isCover?: boolean } = {},
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    try {
      // Validazione del file
      if (!file.type.startsWith('image/')) {
        throw new Error('Il file selezionato non è un\'immagine valida');
      }
      
      // Ottimizza l'immagine prima del caricamento
      const optimizedFile = await this.optimizeImage(file);
      onProgress?.(30);
      
      // Prepara i dati per l'API
      const formData = new FormData();
      formData.append('action', 'upload');
      formData.append('image', optimizedFile);
      formData.append('category', category);
      formData.append('originalName', file.name);
      
      // Aggiungi dati specifici per gli appartamenti
      if (additionalData.apartmentId) {
        formData.append('apartmentId', additionalData.apartmentId);
      }
      
      if (additionalData.isCover !== undefined) {
        formData.append('isCover', additionalData.isCover ? '1' : '0');
      }
      
      onProgress?.(50);
      
      // Esegui la richiesta API
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      onProgress?.(90);
      
      if (!response.ok) {
        throw new Error(`Errore server: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Errore durante il caricamento dell\'immagine');
      }
      
      onProgress?.(100);
      
      return {
        success: true,
        message: 'Immagine caricata con successo',
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Errore caricamento immagine:', error);
      return {
        success: false,
        message: (error as Error).message || 'Errore durante il caricamento dell\'immagine'
      };
    }
  }
  
  /**
   * Ottimizza un'immagine ridimensionandola se necessario
   */
  private async optimizeImage(file: File, maxWidth = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Se l'immagine è già più piccola della dimensione massima, non ridimensionare
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
          reject(new Error("Impossibile ottenere il contesto canvas"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          blob => {
            if (blob) {
              // Converti Blob in File
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
              reject(new Error("Impossibile creare blob dal canvas"));
            }
          },
          file.type,
          0.85 // Qualità immagine (85%)
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Impossibile caricare l'immagine per l'ottimizzazione"));
      };
      
      img.src = url;
    });
  }
  
  /**
   * Recupera la lista delle immagini dal server
   */
  async getImages(category: ImageCategory, apartmentId?: string): Promise<ImageListResult> {
    try {
      let url = `${API_BASE_URL}?action=list&category=${category}`;
      
      if (apartmentId) {
        url += `&apartmentId=${apartmentId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Errore server: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Errore durante il recupero delle immagini');
      }
      
      return {
        success: true,
        message: 'Immagini recuperate con successo',
        images: result.images || []
      };
    } catch (error) {
      console.error('Errore recupero immagini:', error);
      return {
        success: false,
        message: (error as Error).message || 'Errore durante il recupero delle immagini',
        images: []
      };
    }
  }
  
  /**
   * Elimina un'immagine dal server
   */
  async deleteImage(id: string, category: ImageCategory, apartmentId?: string): Promise<ImageDeleteResult> {
    try {
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('id', id);
      formData.append('category', category);
      
      if (apartmentId) {
        formData.append('apartmentId', apartmentId);
      }
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Errore server: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Errore durante l\'eliminazione dell\'immagine');
      }
      
      return {
        success: true,
        message: 'Immagine eliminata con successo',
        id
      };
    } catch (error) {
      console.error('Errore eliminazione immagine:', error);
      return {
        success: false,
        message: (error as Error).message || 'Errore durante l\'eliminazione dell\'immagine',
        id
      };
    }
  }
  
  /**
   * Imposta un'immagine come copertina per un appartamento
   */
  async setCoverImage(id: string, apartmentId: string): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('action', 'setCover');
      formData.append('id', id);
      formData.append('apartmentId', apartmentId);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Errore server: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Errore durante l\'impostazione dell\'immagine di copertina');
      }
      
      return true;
    } catch (error) {
      console.error('Errore impostazione copertina:', error);
      toast.error((error as Error).message || 'Errore durante l\'impostazione dell\'immagine di copertina');
      return false;
    }
  }
  
  /**
   * Aggiorna l'ordine delle immagini per un appartamento
   */
  async updateImagesOrder(apartmentId: string, imageIds: string[]): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('action', 'updateOrder');
      formData.append('apartmentId', apartmentId);
      formData.append('imageIds', JSON.stringify(imageIds));
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Errore server: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Errore durante l\'aggiornamento dell\'ordine delle immagini');
      }
      
      return true;
    } catch (error) {
      console.error('Errore aggiornamento ordine:', error);
      toast.error((error as Error).message || 'Errore durante l\'aggiornamento dell\'ordine delle immagini');
      return false;
    }
  }
}

// Esporta una singola istanza del servizio
export const imageService = new ImageService();

// Esporta le costanti
export { IMAGE_CATEGORIES };

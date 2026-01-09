
import { toast } from "sonner";
import { StoredImage, ImageCategory, getImage, deleteImage } from "./imageStorage";

// Configurazione base
const API_ENDPOINT = "https://tuodominio.it/api/images";
const IMAGE_FOLDERS = {
  hero: "hero_images",
  home: "home_images",
  social: "social_media",
  favicon: "favicons",
};

/**
 * Sincronizza un'immagine con il server, organizzandola in cartelle
 */
export const syncImageToServer = async (path: string): Promise<boolean> => {
  try {
    // Skip se non è un'immagine salvata
    if (!path || !path.startsWith('/upload/')) {
      return false;
    }
    
    // Ottieni l'immagine da IndexedDB
    const image = await getImage(path);
    if (!image || !image.data) {
      return false;
    }
    
    // Determina la cartella di destinazione in base alla categoria
    const targetFolder = IMAGE_FOLDERS[image.category] || 'general';
    
    // Genera un nome file pulito basato sul timestamp e nome originale
    const timestamp = new Date(image.createdAt).toISOString().replace(/[\W_]+/g, "");
    const cleanFileName = image.fileName.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
    const serverFileName = `${timestamp}_${cleanFileName}`;
    
    // Prepara i dati per l'API
    const formData = new FormData();
    formData.append('action', 'store_organized');
    formData.append('path', path);
    formData.append('data', image.data);
    formData.append('category', image.category || 'general');
    formData.append('folder', targetFolder);
    formData.append('fileName', serverFileName);
    formData.append('originalName', image.fileName);
    formData.append('timestamp', image.createdAt.toString());
    
    // Invia al server tramite fetch API
    const response = await fetch(`${API_ENDPOINT}/organized_store.php`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Il server ha risposto con ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      
      // Aggiorna il mapping locale per tenere traccia di dove è stata salvata l'immagine sul server
      await updateLocalPathMapping(path, {
        serverPath: `/${targetFolder}/${serverFileName}`,
        category: image.category,
        timestamp: image.createdAt
      });
      
      return true;
    } else {
      throw new Error(result.message || "Errore sconosciuto durante il salvataggio");
    }
  } catch (error) {
    toast.error("Errore nel salvataggio dell'immagine sul server: " + (error as Error).message);
    return false;
  }
};

/**
 * Elimina un'immagine sia in locale che dal server
 */
export const deleteImageEverywhere = async (path: string): Promise<boolean> => {
  try {
    // Skip se non è un'immagine salvata
    if (!path || !path.startsWith('/upload/')) {
      return false;
    }
    
    // Prima ottieni il mapping dell'immagine per trovare dove è salvata sul server
    const mapping = await getPathMapping(path);
    
    // Elimina localmente
    await deleteImage(path);
    
    // Se abbiamo il mapping del percorso sul server, elimina anche lì
    if (mapping && mapping.serverPath) {
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('path', mapping.serverPath);
      
      const response = await fetch(`${API_ENDPOINT}/delete.php`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Rimuovi anche il mapping
        await removePathMapping(path);
        return true;
      } else {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sincronizza tutte le immagini con il server
 */
export const syncAllImagesToServer = async (): Promise<{success: number, failed: number}> => {
  try {
    
    // Ottieni tutte le immagini da IndexedDB
    const categories: ImageCategory[] = ['hero', 'home', 'social', 'favicon'];
    let successCount = 0;
    let failedCount = 0;
    
    for (const category of categories) {
      try {
        // Ottieni tutte le immagini di questa categoria da IndexedDB
        const db = await openIndexedDB();
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const categoryIndex = store.index('category');
        
        // Promisificare la richiesta
        const images = await new Promise<StoredImage[]>((resolve, reject) => {
          const request = categoryIndex.getAll(category);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        // Sincronizza ogni immagine
        for (const image of images) {
          if (image.path && image.path.startsWith('/upload/')) {
            const synced = await syncImageToServer(image.path);
            if (synced) {
              successCount++;
            } else {
              failedCount++;
            }
          }
        }
        
        db.close();
      } catch (err) {
      }
    }
    
    if (successCount > 0) {
      toast.success(`Sincronizzate ${successCount} immagini con il server`);
    }
    
    if (failedCount > 0) {
      toast.error(`Non è stato possibile sincronizzare ${failedCount} immagini`);
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    return { success: 0, failed: 0 };
  }
};

// Struttura per il mapping tra percorsi locali e server
type PathMapping = {
  localPath: string;
  serverPath: string;
  category: ImageCategory;
  timestamp: number;
};

/**
 * Apre il database IndexedDB per il mapping dei percorsi
 */
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const DB_NAME = 'villaMarePluImages';
    const DB_VERSION = 1;
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Crea object store se non esiste
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'path' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // Crea object store per il mapping dei percorsi
      if (!db.objectStoreNames.contains('pathMapping')) {
        const mappingStore = db.createObjectStore('pathMapping', { keyPath: 'localPath' });
        mappingStore.createIndex('serverPath', 'serverPath', { unique: false });
        mappingStore.createIndex('category', 'category', { unique: false });
      }
    };
  });
};

/**
 * Aggiorna il mapping locale dei percorsi
 */
const updateLocalPathMapping = async (
  localPath: string, 
  mappingData: { serverPath: string; category: ImageCategory; timestamp: number }
): Promise<boolean> => {
  try {
    const db = await openIndexedDB();
    const mapping: PathMapping = {
      localPath,
      serverPath: mappingData.serverPath,
      category: mappingData.category,
      timestamp: mappingData.timestamp
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pathMapping'], 'readwrite');
      const store = transaction.objectStore('pathMapping');
      const request = store.put(mapping);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    return false;
  }
};

/**
 * Ottiene il mapping dei percorsi
 */
const getPathMapping = async (localPath: string): Promise<PathMapping | null> => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pathMapping'], 'readonly');
      const store = transaction.objectStore('pathMapping');
      const request = store.get(localPath);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    return null;
  }
};

/**
 * Rimuove il mapping dei percorsi
 */
const removePathMapping = async (localPath: string): Promise<boolean> => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pathMapping'], 'readwrite');
      const store = transaction.objectStore('pathMapping');
      const request = store.delete(localPath);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    return false;
  }
};

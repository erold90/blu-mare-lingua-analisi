import { toast } from "sonner";

// Chiave per il localStorage per la cache delle immagini
const IMAGE_CACHE_KEY = "imageCache";
const IMAGE_TIMESTAMP_KEY = "imageCacheTimestamp";
const CACHE_VALIDITY_HOURS = 24; // La cache è valida per 24 ore

class ImageService {
  private imageExistenceCache: Map<string, boolean> = new Map();
  private loadingPromises: Map<string, Promise<boolean>> = new Map();
  private preloadedImages: Set<string> = new Set();
  
  constructor() {
    // Carica la cache dal localStorage all'avvio
    this.loadCacheFromStorage();
  }
  
  // Carica la cache da localStorage
  private loadCacheFromStorage(): void {
    try {
      const cachedData = localStorage.getItem(IMAGE_CACHE_KEY);
      const timestamp = localStorage.getItem(IMAGE_TIMESTAMP_KEY);
      
      if (cachedData && timestamp) {
        const currentTime = new Date().getTime();
        const cacheTime = Number(timestamp);
        const hoursSinceCache = (currentTime - cacheTime) / (1000 * 60 * 60);
        
        // Usa la cache solo se è recente
        if (hoursSinceCache < CACHE_VALIDITY_HOURS) {
          const data = JSON.parse(cachedData);
          
          // Popola la cache in memoria
          Object.entries(data).forEach(([path, exists]) => {
            this.imageExistenceCache.set(path, exists as boolean);
          });
          
          console.log(`Cache delle immagini caricata con ${this.imageExistenceCache.size} elementi`);
        } else {
          console.log("Cache delle immagini scaduta, verrà ricostruita");
          this.clearImageCache(); // Pulisce la cache scaduta
        }
      }
    } catch (error) {
      console.error("Errore nel caricamento della cache delle immagini:", error);
    }
  }
  
  // Salva la cache nel localStorage
  private saveCacheToStorage(): void {
    try {
      const data: Record<string, boolean> = {};
      
      // Converti Map in oggetto per il localStorage
      this.imageExistenceCache.forEach((exists, path) => {
        data[path] = exists;
      });
      
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(IMAGE_TIMESTAMP_KEY, String(new Date().getTime()));
      
      console.log(`Cache delle immagini salvata con ${Object.keys(data).length} elementi`);
    } catch (error) {
      console.error("Errore nel salvare la cache delle immagini:", error);
    }
  }

  // Verifica se un'immagine esiste a un determinato percorso (con cache ottimizzata)
  async checkImageExists(path: string): Promise<boolean> {
    // Verifica prima nella cache in memoria
    if (this.imageExistenceCache.has(path)) {
      return this.imageExistenceCache.get(path) || false;
    }
    
    // Se è già in corso una verifica per lo stesso percorso, riusa la Promise
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path) || false;
    }

    // Crea una nuova Promise per la verifica
    const checkPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Aggiungi timestamp per evitare problemi di cache
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${path}?t=${timestamp}`;
        
        // Usa fetch con HEAD per verificare l'esistenza
        const response = await fetch(urlWithTimestamp, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        const exists = response.ok;
        
        // Aggiorna la cache in memoria
        this.imageExistenceCache.set(path, exists);
        
        // Salva la cache nel localStorage periodicamente (ogni 10 nuove voci)
        if (this.imageExistenceCache.size % 10 === 0) {
          this.saveCacheToStorage();
        }
        
        resolve(exists);
      } catch (error) {
        console.error('Errore nella verifica immagine:', error);
        resolve(false);
      } finally {
        // Rimuovi dalla mappa delle promise in corso
        this.loadingPromises.delete(path);
      }
    });
    
    // Memorizza la Promise in corso
    this.loadingPromises.set(path, checkPromise);
    
    return checkPromise;
  }
  
  // Precarica un'immagine in background
  preloadImage(path: string): Promise<boolean> {
    // Evita di precarica immagini già caricate
    if (this.preloadedImages.has(path)) {
      return Promise.resolve(true);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(path);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = this.getImageUrl(path);
    });
  }
  
  // Precarica un gruppo di immagini in background con limite di concorrenza
  preloadImages(paths: string[], concurrency = 3): void {
    if (!paths.length) return;
    
    let index = 0;
    const loadNext = () => {
      if (index >= paths.length) return;
      
      const path = paths[index++];
      this.preloadImage(path).finally(() => {
        loadNext(); // Carica la successiva quando questa è terminata
      });
    };
    
    // Avvia il precaricamento con la concorrenza specificata
    for (let i = 0; i < Math.min(concurrency, paths.length); i++) {
      loadNext();
    }
  }

  // Ottieni l'URL completo per un path con cache busting ottimizzato
  getImageUrl(path: string): string {
    // Usa un timestamp di sessione invece di uno nuovo ogni volta
    // Questo migliora il caching del browser durante l'uso dell'app
    const sessionTimestamp = this.getSessionTimestamp();
    return `${path}?t=${sessionTimestamp}`;
  }
  
  // Usa un timestamp di sessione per evitare di invalidare continuamente la cache
  private getSessionTimestamp(): string {
    const key = "sessionImageTimestamp";
    let timestamp = sessionStorage.getItem(key);
    
    if (!timestamp) {
      timestamp = String(new Date().getTime());
      sessionStorage.setItem(key, timestamp);
    }
    
    return timestamp;
  }
  
  // Forza un nuovo timestamp di sessione (per refresh espliciti)
  resetSessionTimestamp(): void {
    const key = "sessionImageTimestamp";
    const timestamp = String(new Date().getTime());
    sessionStorage.setItem(key, timestamp);
  }
  
  // Force reload dell'immagine
  forceReloadImage(path: string): Promise<boolean> {
    // Rimuovi dalla cache e forza nuovo caricamento
    this.imageExistenceCache.delete(path);
    this.preloadedImages.delete(path);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(path);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      
      // Usa un nuovo timestamp per forzare il ricaricamento
      const timestamp = new Date().getTime();
      img.src = `${path}?t=${timestamp}`;
    });
  }
  
  // OTTIMIZZATO: Pulisce la cache delle immagini
  clearImageCache(): void {
    console.log("Pulizia cache immagini...");
    
    // Pulisci cache in memoria
    this.imageExistenceCache.clear();
    this.preloadedImages.clear();
    
    // Rimuovi da localStorage
    localStorage.removeItem(IMAGE_CACHE_KEY);
    localStorage.removeItem(IMAGE_TIMESTAMP_KEY);
    localStorage.removeItem("apartmentImages");
    
    // Aggiorna il timestamp di sessione
    this.resetSessionTimestamp();
    
    // Pulisci anche la Cache API del browser se disponibile
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    toast.success("Cache delle immagini pulita con successo");
  }
  
  // Normalizza il nome dell'appartamento per i file
  normalizeApartmentId(id: string): string {
    return id.toLowerCase().replace(/\s+/g, '-');
  }

  // OTTIMIZZATO: Cerca tutte le immagini per un appartamento in modo efficiente
  async scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    console.log(`Scansione immagini per appartamento ${apartmentId}`);
    
    // Prima controlla se abbiamo già le immagini in cache
    const cachedAptImages = this.getApartmentImagesFromCache(apartmentId);
    if (cachedAptImages && cachedAptImages.length > 0) {
      console.log(`Trovate ${cachedAptImages.length} immagini in cache per ${apartmentId}`);
      
      // Precarica le immagini in background per renderle più veloci da visualizzare
      this.preloadImages(cachedAptImages);
      
      return cachedAptImages;
    }
    
    // Normalizza l'ID dell'appartamento
    const normalizedId = this.normalizeApartmentId(apartmentId);
    
    // Percorsi base da controllare
    const basePaths = [
      `/images/apartments/${normalizedId}`,
      `/images/apartments/${apartmentId}`
    ];
    
    // Array per memorizzare i percorsi validi trovati
    const validImages: string[] = [];
    
    // Controlla i percorsi in parallelo con un limite di concorrenza
    const checkBatch = async (startIdx: number, endIdx: number, basePath: string) => {
      const batchPromises = [];
      
      for (let i = startIdx; i <= endIdx; i++) {
        const path = `${basePath}/image${i}.jpg`;
        batchPromises.push(
          this.checkImageExists(path).then(exists => {
            if (exists) validImages.push(path);
            return exists;
          })
        );
      }
      
      await Promise.all(batchPromises);
    };
    
    // Verifica prima le prime 5 immagini di ogni percorso (sono quelle più probabili)
    for (const basePath of basePaths) {
      await checkBatch(1, 5, basePath);
    }
    
    // Se abbiamo trovato almeno un'immagine, continua a cercare sul percorso che ha funzionato
    if (validImages.length > 0) {
      // Estrai il percorso base che ha funzionato
      const workingBasePath = validImages[0].substring(0, validImages[0].lastIndexOf('/'));
      
      // Continua a cercare dal numero 6 fino a maxImages
      await checkBatch(6, maxImages, workingBasePath);
    }
    
    // Ordina le immagini numericamente
    validImages.sort((a, b) => {
      const numA = parseInt(a.match(/image(\d+)\.jpg/)?.[1] || "0");
      const numB = parseInt(b.match(/image(\d+)\.jpg/)?.[1] || "0");
      return numA - numB;
    });
    
    // Salva i risultati nella cache
    if (validImages.length > 0) {
      this.cacheApartmentImages(apartmentId, validImages);
      
      // Precarica le immagini in background
      this.preloadImages(validImages);
    }
    
    return validImages;
  }
  
  // Ottieni le immagini di un appartamento dalla cache
  getApartmentImagesFromCache(apartmentId: string): string[] | null {
    try {
      const storedImagesStr = localStorage.getItem("apartmentImages");
      if (!storedImagesStr) return null;
      
      const storedImages = JSON.parse(storedImagesStr);
      return storedImages[apartmentId] || null;
    } catch (error) {
      console.error("Errore nel recuperare le immagini dalla cache:", error);
      return null;
    }
  }
  
  // Salva i risultati delle immagini nella cache
  cacheApartmentImages(apartmentId: string, images: string[]): void {
    try {
      const storedImagesStr = localStorage.getItem("apartmentImages");
      const storedImages = storedImagesStr ? JSON.parse(storedImagesStr) : {};
      
      storedImages[apartmentId] = images;
      localStorage.setItem("apartmentImages", JSON.stringify(storedImages));
      
      // Notifica altri componenti del cambiamento
      window.dispatchEvent(new CustomEvent("apartmentImagesUpdated"));
    } catch (error) {
      console.error("Errore nel salvare le immagini in cache:", error);
    }
  }
  
  // Debug di un'immagine - aggiunge informazioni dettagliate sul percorso e disponibilità
  async debugImage(path: string): Promise<void> {
    console.log(`Debugging image path: ${path}`);
    
    try {
      // Verifica se il path è assoluto o relativo
      const isAbsolutePath = path.startsWith('/');
      console.log(`Image path type: ${isAbsolutePath ? 'absolute' : 'relative'}`);
      
      // Costruisci il percorso completo per il controllo
      const checkPath = isAbsolutePath ? path : `/${path}`;
      console.log(`Full check path: ${checkPath}`);
      
      // Verifica se l'immagine esiste nella cache
      const cachedStatus = this.imageExistenceCache.has(path);
      console.log(`Image in cache: ${cachedStatus ? 'yes' : 'no'}`);
      
      if (cachedStatus) {
        const exists = this.imageExistenceCache.get(path);
        console.log(`Cached status: image ${exists ? 'exists' : 'does not exist'}`);
      }
      
      // Esegue un controllo diretto con fetch per verificare l'esistenza
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${path}?t=${timestamp}`;
      
      console.log(`Checking image with URL: ${urlWithTimestamp}`);
      
      try {
        const response = await fetch(urlWithTimestamp, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        console.log(`Fetch response status: ${response.status} (${response.ok ? 'OK' : 'Failed'})`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
        
      } catch (fetchError) {
        console.error(`Fetch error while checking image:`, fetchError);
      }
      
      // Verifica anche con Image.onload
      console.log(`Testing image loading with Image constructor...`);
      const imgTestPromise = new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Image loaded successfully via Image constructor`);
          resolve(true);
        };
        img.onerror = (error) => {
          console.error(`Failed to load image via Image constructor:`, error);
          resolve(false);
        };
        img.src = urlWithTimestamp;
      });
      
      const imageLoaded = await imgTestPromise;
      console.log(`Final image load test result: ${imageLoaded ? 'Success' : 'Failed'}`);
      
    } catch (error) {
      console.error(`Error during image debugging for ${path}:`, error);
    }
  }
}

// Export a single instance of the service
export const imageService = new ImageService();

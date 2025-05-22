
import { toast } from "sonner";

class ImageService {
  // Verifica se un'immagine esiste a un determinato percorso
  async checkImageExists(path: string): Promise<boolean> {
    try {
      console.log("Verifico esistenza immagine:", path);
      
      // Aggiungo timestamp per evitare problemi di cache
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${path}?t=${timestamp}`;
      
      const response = await fetch(urlWithTimestamp, { 
        method: 'HEAD',
        cache: 'no-store',  // Previene completamente il caching
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`Risultato verifica per ${path}:`, response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error('Errore nella verifica immagine:', error);
      return false;
    }
  }
  
  // Helper per il debugging dei problemi con le immagini
  async debugImage(path: string): Promise<void> {
    console.log(`Avvio debug immagine per ${path}`);
    
    // Aggiungo timestamp per evitare problemi di cache
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${path}?t=${timestamp}`;
    
    try {
      console.log("Tentativo di accesso all'immagine con URL:", urlWithTimestamp);
      
      // Prima provo con HEAD request
      const headResponse = await fetch(urlWithTimestamp, { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache' 
        }
      });
      
      console.log(`Risposta HEAD per ${path}:`, {
        status: headResponse.status,
        statusText: headResponse.statusText,
        ok: headResponse.ok,
        headers: [...headResponse.headers.entries()]
      });
      
      // Poi provo con GET request
      const getResponse = await fetch(urlWithTimestamp, {
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`Risposta GET per ${path}:`, {
        status: getResponse.status,
        statusText: getResponse.statusText,
        ok: getResponse.ok,
        contentType: getResponse.headers.get('content-type')
      });
      
      // Se abbiamo ottenuto una risposta positiva, verifichiamo che sia un'immagine
      if (getResponse.ok && getResponse.headers.get('content-type')?.startsWith('image/')) {
        console.log(`${path} è un'immagine valida`);
        
        // Verifichiamo anche se possiamo creare un blob
        const blob = await getResponse.blob();
        console.log(`Blob creato da ${path}:`, {
          size: blob.size,
          type: blob.type
        });
        
        // Crea un URL per il blob e prova a caricarlo come immagine
        const blobUrl = URL.createObjectURL(blob);
        this.loadImageDirectly(blobUrl, path);
      } else {
        console.error(`${path} NON è un'immagine valida o non è stata trovata`);
      }
      
      // Provo anche a caricare direttamente l'immagine come oggetto Image
      this.loadImageDirectly(urlWithTimestamp, path);
      
    } catch (error) {
      console.error("Errore debug immagine:", error);
    }

    // Prova anche altre varianti del percorso (maiuscole/minuscole)
    const pathParts = path.split('/');
    const fileName = pathParts.pop() || '';
    const directory = pathParts.join('/');
    
    // Prova con varianti del nome file (maiuscole/minuscole)
    const fileNameVariants = [
      fileName,
      fileName.toLowerCase(),
      fileName.toUpperCase(),
      this.capitalizeFirstLetter(fileName)
    ];
    
    // Controlla ogni variante
    for (const variant of fileNameVariants) {
      if (variant === fileName) continue; // Salta la variante originale già controllata
      
      const variantPath = `${directory}/${variant}`;
      console.log(`Verifico variante: ${variantPath}`);
      const existsVariant = await this.checkImageExists(variantPath);
      if (existsVariant) {
        console.log(`✅ Variante trovata: ${variantPath}`);
      }
    }

    // Prova anche con file JPG/PNG/JPEG in caso di estensione sbagliata
    const extensionVariants = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'];
    const baseFileName = fileName.split('.')[0];
    
    for (const ext of extensionVariants) {
      const extPath = `${directory}/${baseFileName}.${ext}`;
      if (extPath === path) continue; // Salta la variante originale
      
      console.log(`Verifico estensione alternativa: ${extPath}`);
      const existsExt = await this.checkImageExists(extPath);
      if (existsExt) {
        console.log(`✅ Estensione alternativa trovata: ${extPath}`);
      }
    }

    // Debug della struttura della directory
    try {
      const response = await fetch(`${directory}?t=${timestamp}`);
      console.log(`Tentativo accesso alla directory ${directory}:`, {
        status: response.status,
        ok: response.ok
      });
    } catch (error) {
      console.error(`Errore nell'accedere alla directory ${directory}:`, error);
    }
  }
  
  // Carica direttamente un'immagine usando l'oggetto Image
  private loadImageDirectly(src: string, originalPath: string): void {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => console.log(`Immagine caricata con successo: ${originalPath} (${img.width}x${img.height})`);
    img.onerror = (err) => console.error(`Errore nel caricare l'immagine: ${originalPath}`, err);
    img.src = src;
  }

  // Ottieni l'URL completo per un path con cache busting
  getImageUrl(path: string): string {
    const timestamp = new Date().getTime();
    return `${path}?t=${timestamp}`;
  }
  
  // Force reload dell'immagine
  forceReloadImage(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Ricaricamento forzato immagine: ${path} completato`);
        resolve(true);
      };
      img.onerror = () => {
        console.error(`Ricaricamento forzato immagine: ${path} fallito`);
        resolve(false);
      };
      img.src = this.getImageUrl(path);
    });
  }
  
  // Normalizza il nome dell'appartamento per i file
  normalizeApartmentId(id: string): string {
    // Rimuove eventuali spazi e converte in lowercase
    return id.toLowerCase().replace(/\s+/g, '-');
  }

  // NUOVO: Converte la prima lettera in maiuscolo
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // NUOVO: Pulisce la cache delle immagini
  clearImageCache(): void {
    console.log("Pulizia cache immagini in corso...");
    
    const now = new Date().getTime();
    const cachePromises = [
      // Prova a eliminare le cache specifiche per immagini
      caches.delete('image-cache'),
      caches.delete('images-cache')
    ];
    
    // Pulisci anche le cache generiche
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        cachePromises.push(caches.delete(cacheName));
      });
    });
    
    Promise.all(cachePromises)
      .then(() => console.log("Pulizia cache completata"))
      .catch(error => console.error("Errore nella pulizia cache:", error));
  }

  // NUOVO: Verifica tutti i percorsi possibili per un'immagine di appartamento
  async findApartmentImage(apartmentId: string, imageNumber: number): Promise<string | null> {
    console.log(`Ricerca approfondita immagine ${imageNumber} per appartamento ${apartmentId}`);
    
    // Normalizza l'ID dell'appartamento
    const normalizedId = this.normalizeApartmentId(apartmentId);
    
    // Crea tutti i possibili percorsi delle immagini
    const potentialPaths = [
      // Percorso standard con ID normalizzato
      `/images/apartments/${normalizedId}/image${imageNumber}.jpg`,
      // Percorso con ID originale
      `/images/apartments/${apartmentId}/image${imageNumber}.jpg`,
      // Varianti con maiuscole
      `/images/apartments/${normalizedId}/Image${imageNumber}.jpg`,
      `/images/apartments/${apartmentId}/Image${imageNumber}.jpg`,
      // Varianti con estensione JPG maiuscolo
      `/images/apartments/${normalizedId}/image${imageNumber}.JPG`,
      `/images/apartments/${apartmentId}/image${imageNumber}.JPG`,
      // Varianti con JPEG
      `/images/apartments/${normalizedId}/image${imageNumber}.jpeg`,
      `/images/apartments/${apartmentId}/image${imageNumber}.jpeg`,
      // Varianti con PNG
      `/images/apartments/${normalizedId}/image${imageNumber}.png`,
      `/images/apartments/${apartmentId}/image${imageNumber}.png`,
    ];
    
    // Prova con numerazione diversa (01, 001, ecc.)
    if (imageNumber < 10) {
      potentialPaths.push(
        `/images/apartments/${normalizedId}/image0${imageNumber}.jpg`,
        `/images/apartments/${apartmentId}/image0${imageNumber}.jpg`
      );
    }
    
    // Verifica ogni percorso
    for (const path of potentialPaths) {
      try {
        const exists = await this.checkImageExists(path);
        if (exists) {
          console.log(`✅ Immagine trovata: ${path}`);
          return path;
        }
      } catch (error) {
        console.error(`Errore nel controllare ${path}:`, error);
      }
    }
    
    console.log(`❌ Nessuna immagine trovata per appartamento ${apartmentId}, numero ${imageNumber}`);
    return null;
  }

  // NUOVO: Scansiona e trova tutte le immagini per un appartamento
  async scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    console.log(`Scansione completa immagini per appartamento ${apartmentId} (max: ${maxImages})`);
    
    const validImages: string[] = [];
    
    // Pulisci la cache prima di iniziare
    this.clearImageCache();
    
    // Cerca le immagini con numerazione progressiva
    for (let i = 1; i <= maxImages; i++) {
      const imagePath = await this.findApartmentImage(apartmentId, i);
      if (imagePath) {
        validImages.push(imagePath);
      } else {
        // Se non troviamo 3 immagini consecutive, assumiamo che non ce ne siano altre
        if (i > 3 && 
            !await this.findApartmentImage(apartmentId, i+1) && 
            !await this.findApartmentImage(apartmentId, i+2)) {
          console.log(`Terminata la ricerca dopo ${i+2} tentativi senza trovare immagini`);
          break;
        }
      }
    }
    
    if (validImages.length > 0) {
      console.log(`✅ Trovate ${validImages.length} immagini per appartamento ${apartmentId}`);
    } else {
      console.warn(`⚠️ Nessuna immagine trovata per appartamento ${apartmentId}`);
      
      // Debug avanzato se non troviamo immagini
      console.log("Avvio debug approfondito...");
      await this.debugImage(`/images/apartments/${apartmentId}/image1.jpg`);
      await this.debugImage(`/images/apartments/${this.normalizeApartmentId(apartmentId)}/image1.jpg`);
    }
    
    return validImages;
  }
}

// Export a single instance of the service
export const imageService = new ImageService();

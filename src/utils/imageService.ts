
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
  
  // Nuovo metodo per convertire il nome dell'appartamento in formato corretto per i file
  normalizeApartmentId(id: string): string {
    // Rimuove eventuali spazi e converte in lowercase
    return id.toLowerCase().replace(/\s+/g, '-');
  }
}

// Export a single instance of the service
export const imageService = new ImageService();

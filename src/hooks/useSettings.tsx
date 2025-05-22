
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface SiteSettings {
  heroImage: string;
  heroImagePosition: string;
  homeImages: string[];
  blockedDates: string[];
  blockedDateRanges: { start: string; end: string }[];
  siteName: string;
  siteDescription: string;
  socialImage: string;
  favicon: string;
}

export interface AdminSettings {
  username: string;
  password: string;
}

interface SettingsContextType {
  siteSettings: SiteSettings;
  adminSettings: AdminSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  addBlockedDate: (date: string) => void;
  removeBlockedDate: (date: string) => void;
  addBlockedDateRange: (start: string, end: string) => void;
  removeBlockedDateRange: (index: number) => void;
  isDateBlocked: (date: Date) => boolean;
  saveImageToStorage: (file: File, category: 'hero' | 'home' | 'social' | 'favicon' | 'socialImage') => Promise<string>;
}

const defaultSiteSettings: SiteSettings = {
  heroImage: "/placeholder.svg",
  heroImagePosition: "center",
  homeImages: [],
  blockedDates: [],
  blockedDateRanges: [],
  siteName: "Villa MareBlu",
  siteDescription: "Villa MareBlu - Appartamenti vacanze sul mare",
  socialImage: "/placeholder.svg",
  favicon: "/favicon.ico"
};

const defaultAdminSettings: AdminSettings = {
  username: "admin",
  password: "205647"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Array of supported file types for images
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Chiave per lo storage delle immagini
const IMAGE_STORAGE_KEY = 'villa_mareblu_images';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const savedSettings = localStorage.getItem("siteSettings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error("Failed to parse saved site settings:", error);
        return defaultSiteSettings;
      }
    }
    return defaultSiteSettings;
  });
  
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error("Failed to parse saved admin settings:", error);
        return defaultAdminSettings;
      }
    }
    return defaultAdminSettings;
  });

  // Funzione per convertire un file in Base64
  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Funzione per ottimizzare un'immagine prima del salvataggio
  const optimizeImage = async (file: File, maxWidth = 1920): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Se l'immagine è già più piccola del massimo, non ridimensionare
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
              // Convert Blob to File by adding required properties
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
          0.85 // Qualità dell'immagine (85%)
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image for optimization"));
      };
      
      img.src = url;
    });
  };

  // Funzione per salvare un'immagine nello storage
  const saveImageToStorage = async (file: File, category: 'hero' | 'home' | 'social' | 'favicon' | 'socialImage'): Promise<string> => {
    try {
      // Validate file type
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Tipo di file non supportato. Carica solo immagini JPG, PNG, WEBP o GIF.');
      }
      
      console.log(`Inizio processo di salvataggio immagine ${category}:`, file.name);
      
      // Ottimizza l'immagine prima del salvataggio
      const optimizedImage = await optimizeImage(file);
      console.log("Immagine ottimizzata:", optimizedImage.size, "bytes");
      
      // Create a unique filename based on timestamp and original name
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const sanitizedFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${category}_${timestamp}_${sanitizedFileName}.${fileExtension}`;
      
      // Convert the image to base64
      const base64Data = await fileToBase64(optimizedImage);
      console.log(`Immagine convertita in base64, lunghezza: ${base64Data.length}`);
      
      // Generate a path that would normally point to a server location
      const imagePath = `/upload/${fileName}`;
      
      // Retrieve existing image storage
      let imageStorage: Record<string, string> = {};
      try {
        const storedImages = localStorage.getItem(IMAGE_STORAGE_KEY);
        if (storedImages) {
          imageStorage = JSON.parse(storedImages);
        }
      } catch (error) {
        console.error("Errore nel recupero delle immagini salvate:", error);
      }
      
      // Check storage size before adding new image
      const storageSize = JSON.stringify(imageStorage).length;
      console.log(`Dimensione storage attuale: ${storageSize} bytes`);
      
      // If we're getting close to localStorage limits (5MB typical), remove old images
      // Lasciamo circa 1MB di spazio per la nuova immagine
      if (storageSize > 4 * 1024 * 1024) {
        console.log("Storage quasi pieno, rimozione immagini vecchie...");
        
        // Keep only essential images and most recent ones
        const essentialCategories = ['hero', 'favicon'];
        const newStorage: Record<string, string> = {};
        
        // First pass: keep essential images (hero, favicon)
        Object.entries(imageStorage).forEach(([path, data]) => {
          if (essentialCategories.some(cat => path.includes(`/${cat}_`))) {
            newStorage[path] = data;
          }
        });
        
        // Second pass: add some recent images if there's room
        const remainingEntries = Object.entries(imageStorage)
          .filter(([path]) => !Object.keys(newStorage).includes(path))
          .sort((a, b) => {
            // Extract timestamps from filenames for sorting
            const tsA = parseInt(a[0].split('_')[1] || '0');
            const tsB = parseInt(b[0].split('_')[1] || '0');
            return tsB - tsA; // Sort descending (newest first)
          });
        
        // Add recent images until we hit ~3MB limit
        let currentSize = JSON.stringify(newStorage).length;
        for (const [path, data] of remainingEntries) {
          if (currentSize + data.length < 3 * 1024 * 1024) {
            newStorage[path] = data;
            currentSize += data.length;
          } else {
            break;
          }
        }
        
        // Update storage with pruned data
        imageStorage = newStorage;
        console.log(`Storage ridotto a ${Object.keys(imageStorage).length} immagini`);
      }
      
      // Add the new image to storage
      imageStorage[imagePath] = base64Data;
      
      // Save the updated image storage
      try {
        localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(imageStorage));
        console.log(`Immagine ${category} salvata con successo in localStorage:`, imagePath);
      } catch (error) {
        console.error("Errore nel salvataggio delle immagini:", error);
        throw new Error("Impossibile salvare l'immagine a causa di limiti di storage. Prova a eliminare alcune immagini.");
      }
      
      return imagePath;
    } catch (error) {
      console.error(`Error saving ${category} image:`, error);
      throw error;
    }
  };
  
  // Funzione per recuperare un'immagine dallo storage
  const getImageFromStorage = (path: string): string | null => {
    if (!path || !path.startsWith('/upload/')) {
      return path; // Not a stored image, return as is
    }
    
    try {
      const imageStorage = localStorage.getItem(IMAGE_STORAGE_KEY);
      if (!imageStorage) return null;
      
      const images = JSON.parse(imageStorage);
      return images[path] || null;
    } catch (error) {
      console.error("Error retrieving image from storage:", error);
      return null;
    }
  };

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
    } catch (error) {
      console.error("Failed to save site settings to localStorage:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    }
  }, [siteSettings]);
  
  useEffect(() => {
    try {
      localStorage.setItem("adminSettings", JSON.stringify(adminSettings));
    } catch (error) {
      console.error("Failed to save admin settings to localStorage:", error);
      toast.error("Errore nel salvataggio delle impostazioni admin");
    }
  }, [adminSettings]);
  
  // Make sure the document title and metadata are updated when settings change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Update document title
      document.title = siteSettings.siteName;
      
      // Update meta tags
      const metaTags = {
        'description': siteSettings.siteDescription,
        'og:title': siteSettings.siteName,
        'og:description': siteSettings.siteDescription,
        'twitter:title': siteSettings.siteName,
        'twitter:description': siteSettings.siteDescription,
      };
      
      Object.entries(metaTags).forEach(([name, content]) => {
        const selector = name.startsWith('og:') 
          ? `meta[property="${name}"]` 
          : `meta[name="${name}"]`;
          
        const element = document.querySelector(selector);
        if (element) {
          element.setAttribute('content', content);
        }
      });
      
      // Update social image if not placeholder
      if (siteSettings.socialImage && !siteSettings.socialImage.includes('placeholder')) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        
        if (ogImage) ogImage.setAttribute('content', siteSettings.socialImage);
        if (twitterImage) twitterImage.setAttribute('content', siteSettings.socialImage);
      }
      
      // Update favicon if changed
      if (siteSettings.favicon && siteSettings.favicon !== '/favicon.ico') {
        const faviconLink = document.querySelector('link[rel="icon"]');
        if (faviconLink) {
          faviconLink.setAttribute('href', siteSettings.favicon);
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = siteSettings.favicon;
          document.head.appendChild(newLink);
        }
      }
    }
  }, [siteSettings.siteName, siteSettings.siteDescription, siteSettings.socialImage, siteSettings.favicon]);
  
  // Monitor localStorage for image changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === IMAGE_STORAGE_KEY && e.newValue) {
        console.log("Rilevate modifiche alle immagini in un'altra scheda");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Replace URL paths with base64 data for images in settings
  useEffect(() => {
    const processImages = () => {
      let hasChanges = false;
      const updatedSettings = {...siteSettings};
      
      // Processa l'immagine hero
      if (updatedSettings.heroImage && updatedSettings.heroImage.startsWith('/upload/')) {
        const heroImageData = getImageFromStorage(updatedSettings.heroImage);
        if (heroImageData && heroImageData !== updatedSettings.heroImage) {
          console.log("Recuperata immagine hero da localStorage");
          hasChanges = true;
        }
      }
      
      // Processa le immagini home
      if (updatedSettings.homeImages && updatedSettings.homeImages.length > 0) {
        updatedSettings.homeImages = updatedSettings.homeImages.map(img => {
          if (img && img.startsWith('/upload/')) {
            const imageData = getImageFromStorage(img);
            if (imageData) {
              hasChanges = true;
              return img; // Mantieni il riferimento, sarà sostituito al momento dell'uso
            }
          }
          return img;
        });
      }
      
      // Processa l'immagine social
      if (updatedSettings.socialImage && updatedSettings.socialImage.startsWith('/upload/')) {
        const socialImageData = getImageFromStorage(updatedSettings.socialImage);
        if (socialImageData && socialImageData !== updatedSettings.socialImage) {
          hasChanges = true;
        }
      }
      
      // Aggiorna le impostazioni solo se ci sono cambiamenti
      if (hasChanges) {
        console.log("Aggiornamento impostazioni con immagini da localStorage");
      }
    };
    
    processImages();
  }, [siteSettings]);
  
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
  };
  
  const updateAdminSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  };
  
  const addBlockedDate = (date: string) => {
    setSiteSettings(prev => ({
      ...prev,
      blockedDates: [...prev.blockedDates, date]
    }));
  };
  
  const removeBlockedDate = (date: string) => {
    setSiteSettings(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter(d => d !== date)
    }));
  };
  
  const addBlockedDateRange = (start: string, end: string) => {
    setSiteSettings(prev => ({
      ...prev,
      blockedDateRanges: [...prev.blockedDateRanges, { start, end }]
    }));
  };
  
  const removeBlockedDateRange = (index: number) => {
    setSiteSettings(prev => ({
      ...prev,
      blockedDateRanges: prev.blockedDateRanges.filter((_, i) => i !== index)
    }));
  };
  
  const isDateBlocked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date is in blocked dates
    if (siteSettings.blockedDates.includes(dateStr)) {
      return true;
    }
    
    // Check if date is within any blocked range
    return siteSettings.blockedDateRanges.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };
  
  // Creare un proxy per le immagini che sostituisce i percorsi con i dati effettivi
  const getProxiedSettings = (): SiteSettings => {
    const proxiedSettings = {...siteSettings};
    
    // Sostituisci i percorsi delle immagini con i dati base64
    if (proxiedSettings.heroImage && proxiedSettings.heroImage.startsWith('/upload/')) {
      const imageData = getImageFromStorage(proxiedSettings.heroImage);
      if (imageData) {
        Object.defineProperty(proxiedSettings, 'heroImage', {
          get: () => imageData,
          enumerable: true,
          configurable: true
        });
      }
    }
    
    return proxiedSettings;
  };
  
  return (
    <SettingsContext.Provider value={{
      siteSettings: getProxiedSettings(),
      adminSettings,
      updateSiteSettings,
      updateAdminSettings,
      addBlockedDate,
      removeBlockedDate,
      addBlockedDateRange,
      removeBlockedDateRange,
      isDateBlocked,
      saveImageToStorage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  
  return context;
};

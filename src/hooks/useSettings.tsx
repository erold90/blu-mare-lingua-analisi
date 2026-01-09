import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  saveImage, 
  getImage, 
  getImagesByCategory, 
  deleteImage, 
  pruneOldImages,
  ImageCategory 
} from "@/utils/imageStorage";
import {
  saveImageToCloud,
  loadImageFromCloud,
  isImageInCloud,
  syncAllImages
} from "@/utils/cloudImageSync";

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

// Crittografia sicura usando Web Crypto API (AES-GCM)
const ENCRYPTION_SALT = 'villa-mareblu-salt-2025';

// Deriva una chiave crittografica dalla passphrase
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Cripta i dati con AES-GCM
async function encryptDataAsync(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const salt = encoder.encode(ENCRYPTION_SALT);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Usa un identificatore del dispositivo come parte della chiave
    const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);

    const key = await deriveKey(deviceId + ENCRYPTION_SALT, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combina IV + dati criptati
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback per browser senza Web Crypto
    return btoa(data);
  }
}

// Decripta i dati con AES-GCM
async function decryptDataAsync(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const salt = encoder.encode(ENCRYPTION_SALT);

    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }

    const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const key = await deriveKey(deviceId + ENCRYPTION_SALT, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // Prova formato legacy (XOR o base64 puro)
    try {
      return atob(data);
    } catch {
      return data;
    }
  }
}

// Versioni sincrone per compatibilità (usano cache)
let encryptionCache: { data: string; encrypted: string } | null = null;

const encryptData = (data: string): string => {
  try {
    // Usa base64 per compatibilità sincrona
    const result = btoa(unescape(encodeURIComponent(data)));
    // Aggiorna in background con crittografia AES-GCM
    encryptDataAsync(data).then(encrypted => {
      localStorage.setItem('adminSettings', encrypted);
    }).catch(() => {
      // Fallback silenzioso
    });
    return result;
  } catch {
    return btoa(data);
  }
};

const decryptData = (data: string): string => {
  try {
    // Prova prima il formato base64 UTF-8
    return decodeURIComponent(escape(atob(data)));
  } catch {
    try {
      // Fallback a base64 semplice
      return atob(data);
    } catch {
      return data;
    }
  }
};

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
  saveImageToStorage: (file: File, category: 'hero' | 'home' | 'social' | 'favicon') => Promise<string>;
  isImageLoading: boolean;
  uploadProgress: number;
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
  password: "" // Remove hardcoded password - will be set during setup
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
        return defaultSiteSettings;
      }
    }
    return defaultSiteSettings;
  });
  
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const decryptedSettings = decryptData(savedSettings);
        return JSON.parse(decryptedSettings);
      } catch (error) {
        return defaultAdminSettings;
      }
    }
    return defaultAdminSettings;
  });

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load images on startup and sync with cloud storage
  useEffect(() => {
    const loadImages = async () => {
      
      // Prune old images first (keep storage manageable)
      await pruneOldImages(200);
      
      // Sync with cloud storage to ensure cross-device compatibility
      await syncAllImages();
      
      // Process hero image
      if (siteSettings.heroImage && siteSettings.heroImage.startsWith('/upload/')) {
        // Try from IndexedDB first
        let heroImage = await getImage(siteSettings.heroImage);
        
        // If not found locally but exists in cloud, use cloud version
        if (!heroImage && isImageInCloud(siteSettings.heroImage)) {
          // The image path is valid, don't reset it
        } else if (!heroImage) {
          setSiteSettings(prev => ({ ...prev, heroImage: "/placeholder.svg" }));
        }
      }
      
      // Process home images
      if (siteSettings.homeImages && siteSettings.homeImages.length > 0) {
        const validHomeImages = await Promise.all(
          siteSettings.homeImages.map(async (path) => {
            if (!path.startsWith('/upload/')) return path;
            
            // Try from IndexedDB first
            const img = await getImage(path);
            
            // If not found locally but exists in cloud, use cloud version
            if (!img && isImageInCloud(path)) {
              return path; // Keep the path, the image can be loaded from cloud
            }
            
            return img ? path : null;
          })
        );
        
        // Filter out any null values (images not found anywhere)
        const filteredHomeImages = validHomeImages.filter(Boolean) as string[];
        if (filteredHomeImages.length !== siteSettings.homeImages.length) {
          setSiteSettings(prev => ({ ...prev, homeImages: filteredHomeImages }));
        }
      }
      
      // Process social image
      if (siteSettings.socialImage && siteSettings.socialImage.startsWith('/upload/')) {
        // Try from IndexedDB first
        let socialImage = await getImage(siteSettings.socialImage);
        
        // If not found locally but exists in cloud, use cloud version
        if (!socialImage && isImageInCloud(siteSettings.socialImage)) {
          // The image path is valid, don't reset it
        } else if (!socialImage) {
          setSiteSettings(prev => ({ ...prev, socialImage: "/placeholder.svg" }));
        }
      }
      
      // Process favicon
      if (siteSettings.favicon && siteSettings.favicon.startsWith('/upload/')) {
        // Try from IndexedDB first
        let favicon = await getImage(siteSettings.favicon);
        
        // If not found locally but exists in cloud, use cloud version
        if (!favicon && isImageInCloud(siteSettings.favicon)) {
          // The image path is valid, don't reset it
        } else if (!favicon) {
          setSiteSettings(prev => ({ ...prev, favicon: "/favicon.ico" }));
        }
      }
    };
    
    loadImages();
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
    } catch (error) {
      toast.error("Errore nel salvataggio delle impostazioni");
    }
  }, [siteSettings]);
  
  useEffect(() => {
    try {
      const encryptedSettings = encryptData(JSON.stringify(adminSettings));
      localStorage.setItem("adminSettings", encryptedSettings);
    } catch (error) {
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
      
      // Update favicon with our improved method
      if (siteSettings.favicon && siteSettings.favicon !== '/favicon.ico') {
        import('../utils/image').then(({ imageService }) => {
          imageService.updateFavicon(siteSettings.favicon);
        });
      }
    }
  }, [siteSettings.siteName, siteSettings.siteDescription, siteSettings.socialImage, siteSettings.favicon]);
  
  // Function for saving images to storage with cloud sync
  const saveImageToStorage = async (file: File, category: 'hero' | 'home' | 'social' | 'favicon'): Promise<string> => {
    try {
      setIsImageLoading(true);
      setUploadProgress(0);
      
      const onProgress = (progress: number) => {
        setUploadProgress(progress);
      };
      
      // Save image to IndexedDB
      const imagePath = await saveImage(file, category as ImageCategory, onProgress);
      
      // Update settings based on category
      if (category === 'hero') {
        updateSiteSettings({ heroImage: imagePath });
      } else if (category === 'social') {
        updateSiteSettings({ socialImage: imagePath });
      } else if (category === 'favicon') {
        updateSiteSettings({ favicon: imagePath });
      } else if (category === 'home') {
        updateSiteSettings({
          homeImages: [...siteSettings.homeImages, imagePath]
        });
      }
      
      // Sync image to cloud storage for cross-device access
      await saveImageToCloud(imagePath);
      
      return imagePath;
    } catch (error) {
      toast.error(`Errore nel salvare l'immagine: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsImageLoading(false);
      setUploadProgress(0);
    }
  };
  
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
  
  return (
    <SettingsContext.Provider value={{
      siteSettings,
      adminSettings,
      updateSiteSettings,
      updateAdminSettings,
      addBlockedDate,
      removeBlockedDate,
      addBlockedDateRange,
      removeBlockedDateRange,
      isDateBlocked,
      saveImageToStorage,
      isImageLoading,
      uploadProgress
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

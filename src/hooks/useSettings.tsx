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

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load images on startup and sync with cloud storage
  useEffect(() => {
    const loadImages = async () => {
      console.log("SettingsProvider: Loading images and syncing with cloud");
      
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
          console.log("Hero image found in cloud storage");
          // The image path is valid, don't reset it
        } else if (!heroImage) {
          console.warn("Hero image not found in any storage, resetting to default");
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
          console.warn("Some home images were not found in any storage, updating list");
          setSiteSettings(prev => ({ ...prev, homeImages: filteredHomeImages }));
        }
      }
      
      // Process social image
      if (siteSettings.socialImage && siteSettings.socialImage.startsWith('/upload/')) {
        // Try from IndexedDB first
        let socialImage = await getImage(siteSettings.socialImage);
        
        // If not found locally but exists in cloud, use cloud version
        if (!socialImage && isImageInCloud(siteSettings.socialImage)) {
          console.log("Social image found in cloud storage");
          // The image path is valid, don't reset it
        } else if (!socialImage) {
          console.warn("Social image not found in any storage, resetting to default");
          setSiteSettings(prev => ({ ...prev, socialImage: "/placeholder.svg" }));
        }
      }
      
      // Process favicon
      if (siteSettings.favicon && siteSettings.favicon.startsWith('/upload/')) {
        // Try from IndexedDB first
        let favicon = await getImage(siteSettings.favicon);
        
        // If not found locally but exists in cloud, use cloud version
        if (!favicon && isImageInCloud(siteSettings.favicon)) {
          console.log("Favicon found in cloud storage");
          // The image path is valid, don't reset it
        } else if (!favicon) {
          console.warn("Favicon not found in any storage, resetting to default");
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
      console.error(`Error saving ${category} image:`, error);
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

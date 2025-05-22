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
  deleteImageFromStorage: (imagePath: string) => void;
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

// Helper to convert blob URL to base64 with compression
const blobToBase64 = async (blobUrl: string, maxDimension = 1200): Promise<string> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      // Create an image element to load the blob
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
        
        // Draw the image to a canvas with the new dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas to a data URL with compression
        const quality = 0.7; // Adjust this value to balance quality and size
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error("Error converting blob to base64:", error);
    throw error;
  }
};

// Helper to check if we can store data in localStorage
const canStoreInLocalStorage = (data: string): boolean => {
  try {
    // Get current localStorage usage
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += value.length * 2; // Each character is approximately 2 bytes
      }
    }
    
    // Check if adding new data would exceed quota
    const newDataSize = data.length * 2; // Each character is approximately 2 bytes
    const estimatedTotalSize = totalSize + newDataSize;
    
    // Most browsers have a 5MB limit, so we'll use 4.5MB as our safe limit
    const safeLimit = 4.5 * 1024 * 1024; // 4.5MB in bytes
    
    return estimatedTotalSize < safeLimit;
  } catch (e) {
    console.error("Error checking localStorage capacity:", e);
    return false;
  }
};

// Helper to clear old images if needed
const clearOldImagesIfNeeded = (category: string, keepCount = 10): void => {
  try {
    const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
    
    // Find images in the specified category
    const categoryImages = Object.keys(imageStorage).filter(
      key => key.includes(`/images/${category}/`)
    );
    
    // If we have more images than our keep count, remove the oldest ones
    if (categoryImages.length > keepCount) {
      // Sort by timestamp (assuming the format includes a timestamp)
      categoryImages.sort((a, b) => {
        const timeA = parseInt(a.split('_')[1]?.split('.')[0] || '0');
        const timeB = parseInt(b.split('_')[1]?.split('.')[0] || '0');
        return timeA - timeB;
      });
      
      // Delete oldest images
      const imagesToDelete = categoryImages.slice(0, categoryImages.length - keepCount);
      imagesToDelete.forEach(key => {
        delete imageStorage[key];
      });
      
      localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
      console.log(`Cleared ${imagesToDelete.length} old images from ${category} category`);
    }
  } catch (e) {
    console.error("Error clearing old images:", e);
  }
};

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

  // Function to generate a unique filename
  const generateUniqueFilename = (file: File, category: string): string => {
    const timestamp = new Date().getTime();
    const extension = file.name.split('.').pop();
    return `${category}_${timestamp}.${extension}`;
  };
  
  // Function to save image to storage with compression
  const saveImageToStorage = async (file: File, category: 'hero' | 'home' | 'social' | 'favicon' | 'socialImage'): Promise<string> => {
    // For consistency, map 'socialImage' to 'social' category in storage path
    const storageCategory = category === 'socialImage' ? 'social' : category;
    
    try {
      // Create a unique filename
      const filename = generateUniqueFilename(file, storageCategory);
      
      // Create a blob URL for the file
      const objectURL = URL.createObjectURL(file);
      
      // Convert blob URL to compressed base64
      const maxDimensions = category === 'favicon' ? 64 : 1200;
      const base64Data = await blobToBase64(objectURL, maxDimensions);
      
      // Free memory
      URL.revokeObjectURL(objectURL);
      
      // Save the filepath in a format that represents our intention
      const imagePath = `/images/${storageCategory}/${filename}`;
      
      // Check if we have space and clear old images if needed
      clearOldImagesIfNeeded(storageCategory);
      
      // Get existing image storage
      const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
      
      // Check if we can store the new image
      if (!canStoreInLocalStorage(base64Data)) {
        // If we can't store more images, try to free up space
        const oldestKey = Object.keys(imageStorage)[0];
        if (oldestKey) {
          delete imageStorage[oldestKey];
          console.log("Removed oldest image to free up space");
        } else {
          throw new Error("Spazio di archiviazione esaurito. Prova a eliminare alcune immagini.");
        }
      }
      
      // Store the mapping between the path and the base64 data in localStorage
      imageStorage[imagePath] = base64Data;
      
      try {
        localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
      } catch (storageError) {
        console.error("Storage quota exceeded:", storageError);
        
        // If we still exceed quota, compress further or delete more images
        if (storageCategory === 'home' && Object.keys(imageStorage).length > 5) {
          // For home images, limit to 5 if we're having storage issues
          clearOldImagesIfNeeded(storageCategory, 5);
          
          // Try again with fewer images
          localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
        } else {
          throw new Error("Spazio di archiviazione pieno. Elimina alcune immagini esistenti.");
        }
      }
      
      return imagePath;
    } catch (error) {
      console.error(`Error saving ${category} image:`, error);
      throw error;
    }
  };
  
  // Function to delete image from storage
  const deleteImageFromStorage = (imagePath: string): void => {
    if (!imagePath || (!imagePath.startsWith('/images/') && !imagePath.startsWith('/storage/'))) return;
    
    try {
      const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
      
      // Remove from our storage mapping
      delete imageStorage[imagePath];
      localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Errore durante l'eliminazione dell'immagine");
    }
  };
  
  // On first load, process any blob URLs in the settings and convert them to base64 if needed
  useEffect(() => {
    const processImages = async () => {
      let updated = false;
      const newSettings = { ...siteSettings };
      
      // Process hero image
      if (newSettings.heroImage && newSettings.heroImage.startsWith('blob:')) {
        try {
          const base64Data = await blobToBase64(newSettings.heroImage);
          const storageKey = `/images/hero/hero_${Date.now()}.jpg`;
          
          const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
          imageStorage[storageKey] = base64Data;
          
          try {
            localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
            newSettings.heroImage = storageKey;
            updated = true;
          } catch (storageError) {
            console.error("Storage quota exceeded for hero image:", storageError);
            newSettings.heroImage = "/placeholder.svg";
          }
        } catch (error) {
          console.error("Failed to convert hero image:", error);
          newSettings.heroImage = "/placeholder.svg";
        }
      }
      
      // Process home images with more careful storage management
      if (newSettings.homeImages && newSettings.homeImages.length > 0) {
        const newHomeImages = [...newSettings.homeImages];
        let homeImagesUpdated = false;
        
        for (let i = 0; i < newHomeImages.length; i++) {
          if (newHomeImages[i] && newHomeImages[i].startsWith('blob:')) {
            try {
              // Process only a few images at a time to avoid quota issues
              if (i > 5) {
                // Skip processing too many blob images at once
                newHomeImages[i] = "";
                continue;
              }
              
              const base64Data = await blobToBase64(newHomeImages[i]);
              const storageKey = `/images/home/home_${Date.now()}_${i}.jpg`;
              
              const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
              
              if (canStoreInLocalStorage(base64Data)) {
                imageStorage[storageKey] = base64Data;
                
                try {
                  localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
                  newHomeImages[i] = storageKey;
                  homeImagesUpdated = true;
                } catch (storageError) {
                  console.error(`Storage quota exceeded for home image ${i}:`, storageError);
                  newHomeImages[i] = "";
                }
              } else {
                console.warn(`Skipping home image ${i} due to storage limitations`);
                newHomeImages[i] = "";
              }
            } catch (error) {
              console.error(`Failed to convert home image at index ${i}:`, error);
              newHomeImages[i] = "";
            }
          }
        }
        
        if (homeImagesUpdated) {
          newSettings.homeImages = newHomeImages.filter(img => img && img !== '');
          updated = true;
        }
      }
      
      // Process social image
      if (newSettings.socialImage && newSettings.socialImage.startsWith('blob:')) {
        try {
          const base64Data = await blobToBase64(newSettings.socialImage);
          const storageKey = `/images/social/social_${Date.now()}.jpg`;
          
          const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
          
          if (canStoreInLocalStorage(base64Data)) {
            imageStorage[storageKey] = base64Data;
            
            try {
              localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
              newSettings.socialImage = storageKey;
              updated = true;
            } catch (storageError) {
              console.error("Storage quota exceeded for social image:", storageError);
              newSettings.socialImage = "/placeholder.svg";
            }
          } else {
            console.warn("Skipping social image due to storage limitations");
            newSettings.socialImage = "/placeholder.svg";
          }
        } catch (error) {
          console.error("Failed to convert social image:", error);
          newSettings.socialImage = "/placeholder.svg";
        }
      }
      
      // Process favicon (smaller size)
      if (newSettings.favicon && newSettings.favicon.startsWith('blob:')) {
        try {
          // Use smaller max dimension for favicon
          const base64Data = await blobToBase64(newSettings.favicon, 64);
          const storageKey = `/images/favicon/favicon_${Date.now()}.png`;
          
          const imageStorage = JSON.parse(localStorage.getItem('imageStorage') || '{}');
          imageStorage[storageKey] = base64Data;
          
          try {
            localStorage.setItem('imageStorage', JSON.stringify(imageStorage));
            newSettings.favicon = storageKey;
            updated = true;
          } catch (storageError) {
            console.error("Storage quota exceeded for favicon:", storageError);
            newSettings.favicon = "/favicon.ico";
          }
        } catch (error) {
          console.error("Failed to convert favicon:", error);
          newSettings.favicon = "/favicon.ico";
        }
      }
      
      if (updated) {
        setSiteSettings(newSettings);
      }
    };
    
    processImages();
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
      console.log("Site settings saved:", siteSettings);
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
  
  // Override the updateSiteSettings function to handle image paths
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      // Create the updated settings
      const updated = { ...prev, ...settings };
      return updated;
    });
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
      deleteImageFromStorage
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

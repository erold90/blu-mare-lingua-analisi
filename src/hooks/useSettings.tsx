
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

  // Function to save an image to public directory
  const saveImageToStorage = async (file: File, category: 'hero' | 'home' | 'social' | 'favicon' | 'socialImage'): Promise<string> => {
    try {
      // Validate file type
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Tipo di file non supportato. Carica solo immagini JPG, PNG, WEBP o GIF.');
      }
      
      // Create a unique filename based on timestamp and original name
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const sanitizedFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${category}_${timestamp}_${sanitizedFileName}.${fileExtension}`;
      
      // In a real app with server storage, we would upload the file to a server here
      // Since we're in a client-side only app for now, we'll create a URL for the file
      // This URL will be valid until the browser session ends
      const objectUrl = URL.createObjectURL(file);
      
      // For persistence, we would normally save this file to the server
      // For now, we'll return the object URL which will work for the current session
      // In a real app, this would return the URL to the saved file on the server
      
      // Store the mapping in localStorage for persistence across browser refreshes
      // Note: This is a workaround for the demo. In a real app, the server would handle this.
      const imageMapKey = 'villa_mareblu_image_map';
      let imageMap = {};
      try {
        const storedMap = localStorage.getItem(imageMapKey);
        if (storedMap) {
          imageMap = JSON.parse(storedMap);
        }
      } catch (e) {
        console.error("Failed to parse image map:", e);
      }
      
      // Generate a path that would normally point to a server location
      const imagePath = `/upload/${fileName}`;
      
      // Store the mapping between the path and the object URL
      imageMap[imagePath] = objectUrl;
      
      // Save the updated map
      localStorage.setItem(imageMapKey, JSON.stringify(imageMap));
      
      return imagePath;
    } catch (error) {
      console.error(`Error saving ${category} image:`, error);
      throw error;
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
  
  // Helper to map object URLs from our local storage to usable URLs
  useEffect(() => {
    const imageMapKey = 'villa_mareblu_image_map';
    try {
      const storedMap = localStorage.getItem(imageMapKey);
      if (storedMap) {
        const imageMap = JSON.parse(storedMap);
        
        // For each stored image URL in our settings, check if we need to replace it with an object URL
        const updateSettings = {...siteSettings};
        let hasChanges = false;
        
        // Check hero image
        if (updateSettings.heroImage && updateSettings.heroImage.startsWith('/upload/')) {
          if (imageMap[updateSettings.heroImage]) {
            hasChanges = true;
          }
        }
        
        // Check home images
        if (updateSettings.homeImages && updateSettings.homeImages.length > 0) {
          updateSettings.homeImages = updateSettings.homeImages.map(img => {
            if (img && img.startsWith('/upload/') && imageMap[img]) {
              hasChanges = true;
              return img;
            }
            return img;
          });
        }
        
        // Check social image
        if (updateSettings.socialImage && updateSettings.socialImage.startsWith('/upload/')) {
          if (imageMap[updateSettings.socialImage]) {
            hasChanges = true;
          }
        }
        
        // Check favicon
        if (updateSettings.favicon && updateSettings.favicon.startsWith('/upload/')) {
          if (imageMap[updateSettings.favicon]) {
            hasChanges = true;
          }
        }
        
        // If we made changes, update the settings
        if (hasChanges) {
          setSiteSettings(updateSettings);
        }
      }
    } catch (e) {
      console.error("Failed to process image map:", e);
    }
  }, []);
  
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

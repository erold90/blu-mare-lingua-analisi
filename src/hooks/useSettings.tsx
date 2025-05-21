import React, { createContext, useContext, useState, useEffect } from "react";

export interface SiteSettings {
  heroImage: string;
  heroImagePosition: string; // Added to store image position
  blockedDates: string[]; // ISO date strings
  blockedDateRanges: { start: string; end: string }[]; // ISO date strings
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
}

const defaultSiteSettings: SiteSettings = {
  heroImage: "/placeholder.svg",
  heroImagePosition: "center", // Default position is center
  blockedDates: [],
  blockedDateRanges: []
};

const defaultAdminSettings: AdminSettings = {
  username: "admin",
  password: "205647"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

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
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
    console.log("Site settings saved:", siteSettings); // Add logging to debug
  }, [siteSettings]);
  
  useEffect(() => {
    localStorage.setItem("adminSettings", JSON.stringify(adminSettings));
  }, [adminSettings]);
  
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
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
      isDateBlocked
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

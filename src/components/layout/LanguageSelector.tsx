import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Language {
  code: string;
  label: string;
  gtCode: string;
}

const languages: Language[] = [
  { code: "ITA", label: "Italiano", gtCode: "it" },
  { code: "ENG", label: "English", gtCode: "en" },
  { code: "DEU", label: "Deutsch", gtCode: "de" },
  { code: "FRA", label: "Français", gtCode: "fr" },
  { code: "ESP", label: "Español", gtCode: "es" },
  { code: "NLD", label: "Nederlands", gtCode: "nl" },
  { code: "RUS", label: "Русский", gtCode: "ru" },
  { code: "POL", label: "Polski", gtCode: "pl" },
];

// Declare window extension for GTranslate
declare global {
  interface Window {
    doGTranslate?: (lang_pair: string) => void;
    gtranslateSettings?: {
      default_language: string;
      languages: string[];
    };
  }
}

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGTranslateReady, setIsGTranslateReady] = useState(false);

  // Check if GTranslate is ready
  const checkGTranslateReady = useCallback(() => {
    if (typeof window.doGTranslate === 'function') {
      setIsGTranslateReady(true);
      return true;
    }
    return false;
  }, []);

  // Detect current language from cookies or DOM
  const detectCurrentLanguage = useCallback(() => {
    // Method 1: Check googtrans cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans' && value) {
        const match = value.match(/\/[a-z]{2}\/([a-z]{2})/);
        if (match) {
          const langCode = match[1];
          const found = languages.find(l => l.gtCode === langCode);
          if (found) {
            return found;
          }
        }
      }
    }

    // Method 2: Check for Google Translate select element
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select && select.value) {
      const found = languages.find(l => l.gtCode === select.value);
      if (found) {
        return found;
      }
    }

    // Method 3: Check html lang attribute changes
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang !== 'it') {
      const found = languages.find(l => l.gtCode === htmlLang.split('-')[0]);
      if (found) {
        return found;
      }
    }

    return languages[0]; // Default to Italian
  }, []);

  // Initialize and detect language on mount
  useEffect(() => {
    // Check for GTranslate readiness periodically
    const checkInterval = setInterval(() => {
      if (checkGTranslateReady()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Stop checking after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);

    // Initial language detection
    const detected = detectCurrentLanguage();
    setCurrentLang(detected);

    // Monitor for language changes
    const detectInterval = setInterval(() => {
      const detected = detectCurrentLanguage();
      setCurrentLang(detected);
    }, 2000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(detectInterval);
      clearTimeout(timeout);
    };
  }, [checkGTranslateReady, detectCurrentLanguage]);

  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);

    // Try to use GTranslate's doGTranslate function
    if (typeof window.doGTranslate === 'function') {
      // GTranslate expects format: "source|target"
      window.doGTranslate(`it|${lang.gtCode}`);
    } else {
      // Fallback: Set cookies and reload
      // Clear existing googtrans cookies
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;

      if (lang.gtCode !== 'it') {
        // Set new cookie for non-Italian languages
        const cookieValue = `/it/${lang.gtCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;
      }

      // Reload to apply translation
      window.location.reload();
    }
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-2 h-8 text-muted-foreground hover:text-foreground transition-colors"
          title={isGTranslateReady ? "Seleziona lingua" : "Caricamento traduttore..."}
        >
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-xs font-medium">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang)}
            className={`flex items-center justify-between cursor-pointer ${
              currentLang.code === lang.code ? "bg-accent" : ""
            }`}
          >
            <span className="text-sm">{lang.label}</span>
            <span className="text-xs text-muted-foreground font-mono">{lang.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

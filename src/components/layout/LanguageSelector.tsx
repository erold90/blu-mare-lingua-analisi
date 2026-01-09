import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Globe, Check } from "lucide-react";
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
  googleCode: string;
}

const languages: Language[] = [
  { code: "ITA", label: "Italiano", googleCode: "it" },
  { code: "ENG", label: "English", googleCode: "en" },
  { code: "DEU", label: "Deutsch", googleCode: "de" },
  { code: "FRA", label: "Français", googleCode: "fr" },
  { code: "ESP", label: "Español", googleCode: "es" },
  { code: "NLD", label: "Nederlands", googleCode: "nl" },
  { code: "RUS", label: "Русский", googleCode: "ru" },
  { code: "POL", label: "Polski", googleCode: "pl" },
];

const STORAGE_KEY = 'villamareblu_language';

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);

  // Detect current language from cookie
  const detectCurrentLanguage = useCallback(() => {
    // Check googtrans cookie
    const match = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
    if (match) {
      const langCode = match[1];
      const found = languages.find(l => l.googleCode === langCode);
      if (found) {
        return found;
      }
    }
    return languages[0]; // Default Italian
  }, []);

  // Initialize
  useEffect(() => {
    // Check if Google Translate is ready
    const checkReady = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        setIsTranslateReady(true);

        // Restore language from localStorage or cookie
        const saved = localStorage.getItem(STORAGE_KEY);
        const detected = detectCurrentLanguage();

        if (saved && saved !== 'it') {
          const found = languages.find(l => l.googleCode === saved);
          if (found) {
            setCurrentLang(found);
            // Apply saved language
            setTimeout(() => {
              triggerTranslation(saved);
            }, 100);
          }
        } else {
          setCurrentLang(detected);
        }
        return true;
      }
      return false;
    };

    // Listen for Google Translate ready event
    const handleReady = () => {
      setTimeout(checkReady, 500);
    };

    window.addEventListener('googleTranslateReady', handleReady);

    // Also poll for readiness
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      window.removeEventListener('googleTranslateReady', handleReady);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [detectCurrentLanguage]);

  // Trigger translation via Google Translate select
  const triggerTranslation = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, lang.googleCode);

    if (lang.googleCode === 'it') {
      // Reset to Italian - need to restore original page
      // Clear the googtrans cookie and reload
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;

      // Try to use Google Translate's reset function
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Trigger translation
    triggerTranslation(lang.googleCode);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-2 h-8 text-muted-foreground hover:text-foreground transition-colors"
          title="Seleziona lingua"
        >
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-xs font-medium">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm">{lang.label}</span>
            <div className="flex items-center gap-2">
              {currentLang.code === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
              <span className="text-xs text-muted-foreground font-mono">{lang.code}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

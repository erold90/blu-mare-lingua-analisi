import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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

// Set Google Translate cookie on all necessary domains
const setTranslateCookie = (targetLang: string) => {
  const hostname = window.location.hostname;
  const domains = ['', hostname, '.' + hostname];

  if (targetLang === 'it') {
    // Clear ALL googtrans cookies thoroughly
    domains.forEach(domain => {
      const domainStr = domain ? `; domain=${domain}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainStr}`;
    });
    // Also try without any domain specification
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  } else {
    // Set cookie for target language
    const value = `/it/${targetLang}`;
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    domains.forEach(domain => {
      const domainStr = domain ? `; domain=${domain}` : '';
      document.cookie = `googtrans=${value}; expires=${expires}; path=/${domainStr}`;
    });
  }
};

// Detect current language - localStorage is the source of truth
const detectCurrentLanguage = (): Language => {
  // localStorage is our source of truth
  const savedLang = localStorage.getItem(STORAGE_KEY);

  // If nothing in localStorage, it means Italian (default)
  if (!savedLang) {
    return languages[0]; // Italian
  }

  // Find the saved language
  const found = languages.find(l => l.googleCode === savedLang);
  return found || languages[0];
};

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize: detect current language from localStorage only
  useEffect(() => {
    const detected = detectCurrentLanguage();
    setCurrentLang(detected);
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    // Don't do anything if same language
    if (lang.googleCode === currentLang.googleCode) {
      setIsOpen(false);
      return;
    }

    // Update state and close menu
    setCurrentLang(lang);
    setIsOpen(false);

    // Save preference to localStorage FIRST (source of truth)
    if (lang.googleCode === 'it') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, lang.googleCode);
    }

    // Set/clear cookie for Google Translate
    setTranslateCookie(lang.googleCode);

    // Small delay to ensure everything is set, then reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [currentLang.googleCode]);

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

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

// Clear all googtrans cookies thoroughly
const clearAllGoogTransCookies = () => {
  const hostname = window.location.hostname;
  const paths = ['/', ''];
  const domains = ['', hostname, '.' + hostname, '.villamareblu.it', 'villamareblu.it'];

  paths.forEach(path => {
    domains.forEach(domain => {
      const domainStr = domain ? `; domain=${domain}` : '';
      const pathStr = path ? `; path=${path}` : '';
      document.cookie = `googtrans=${pathStr}${domainStr}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    });
  });

  // Extra attempts without domain
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
};

// Set Google Translate cookie
const setTranslateCookie = (targetLang: string) => {
  if (targetLang === 'it') {
    clearAllGoogTransCookies();
    return;
  }

  const hostname = window.location.hostname;
  const value = `/it/${targetLang}`;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

  // Set on multiple domains to ensure it works
  const domains = ['', hostname, '.' + hostname];
  domains.forEach(domain => {
    const domainStr = domain ? `; domain=${domain}` : '';
    document.cookie = `googtrans=${value}; expires=${expires}; path=/${domainStr}`;
  });
};

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize: detect current language from localStorage ONLY
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY);

    if (savedLang) {
      const found = languages.find(l => l.googleCode === savedLang);
      if (found) {
        setCurrentLang(found);
      }
    }
    // If no savedLang, keep default (Italian)
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    // Don't do anything if same language
    if (lang.googleCode === currentLang.googleCode) {
      setIsOpen(false);
      return;
    }

    // Close menu immediately
    setIsOpen(false);

    // Handle Italian (reset)
    if (lang.googleCode === 'it') {
      // 1. Remove from localStorage
      localStorage.removeItem(STORAGE_KEY);

      // 2. Clear all cookies
      clearAllGoogTransCookies();

      // 3. Update state
      setCurrentLang(languages[0]);

      // 4. Reload after ensuring storage is cleared
      requestAnimationFrame(() => {
        window.location.reload();
      });
      return;
    }

    // Handle other languages
    // 1. Save to localStorage first
    localStorage.setItem(STORAGE_KEY, lang.googleCode);

    // 2. Set cookie
    setTranslateCookie(lang.googleCode);

    // 3. Update state
    setCurrentLang(lang);

    // 4. Reload after ensuring storage is set
    requestAnimationFrame(() => {
      window.location.reload();
    });
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

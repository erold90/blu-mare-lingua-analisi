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

const COOKIE_NAME = "googtrans";
const STORAGE_KEY = "villamareblu_language";

// Get cookie value
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Set cookie with proper domain handling
const setGoogTransCookie = (lang: string) => {
  const value = lang === 'it' ? '' : `/auto/${lang}`;
  const hostname = window.location.hostname;

  // Calculate root domain (e.g., villamareblu.it from www.villamareblu.it)
  const domainParts = hostname.split('.');
  const rootDomain = domainParts.length > 2
    ? '.' + domainParts.slice(-2).join('.')
    : '.' + hostname;

  const expiry = lang === 'it'
    ? 'Thu, 01 Jan 1970 00:00:00 UTC'
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

  // Clear existing cookies first
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain}`;

  if (lang !== 'it') {
    // Set new cookie on multiple domains for compatibility
    document.cookie = `${COOKIE_NAME}=${value}; expires=${expiry}; path=/`;
    document.cookie = `${COOKIE_NAME}=${value}; expires=${expiry}; path=/; domain=${hostname}`;
    document.cookie = `${COOKIE_NAME}=${value}; expires=${expiry}; path=/; domain=${rootDomain}`;
  }
};

// Parse current language from cookie
const getLanguageFromCookie = (): string => {
  const cookieValue = getCookie(COOKIE_NAME);
  if (cookieValue) {
    // Format: /auto/xx or /it/xx
    const parts = cookieValue.split('/');
    if (parts.length >= 3) {
      return parts[2];
    }
  }
  return 'it';
};

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize language from cookie or localStorage
  useEffect(() => {
    // Priority: localStorage > cookie > default (Italian)
    const storedLang = localStorage.getItem(STORAGE_KEY);
    const cookieLang = getLanguageFromCookie();

    const langCode = storedLang || (cookieLang !== 'it' ? cookieLang : null);

    if (langCode) {
      const found = languages.find(l => l.googleCode === langCode);
      if (found) {
        setCurrentLang(found);
      }
    }
  }, []);

  const switchLanguage = useCallback((lang: Language) => {
    if (lang.googleCode === currentLang.googleCode) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Update localStorage
    if (lang.googleCode === 'it') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, lang.googleCode);
    }

    // Set the googtrans cookie
    setGoogTransCookie(lang.googleCode);

    // Reload page to apply translation
    window.location.reload();
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
            onClick={() => switchLanguage(lang)}
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

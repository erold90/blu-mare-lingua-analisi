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

// Helper to set cookie on multiple domains for Google Translate
const setGoogleTranslateCookie = (langCode: string) => {
  const value = langCode === 'it' ? '' : `/it/${langCode}`;
  const expires = langCode === 'it'
    ? 'Thu, 01 Jan 1970 00:00:00 UTC'
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

  // Clear or set on various paths/domains
  const domains = ['', window.location.hostname, '.' + window.location.hostname];
  domains.forEach(domain => {
    const domainPart = domain ? `; domain=${domain}` : '';
    if (langCode === 'it') {
      document.cookie = `googtrans=; expires=${expires}; path=/${domainPart}`;
    } else {
      document.cookie = `googtrans=${value}; expires=${expires}; path=/${domainPart}`;
    }
  });
};

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);

  // Detect current language from cookie or localStorage
  const detectCurrentLanguage = useCallback((): Language => {
    // First check localStorage (our preference)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = languages.find(l => l.googleCode === saved);
      if (found) return found;
    }

    // Then check googtrans cookie
    const match = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
    if (match) {
      const langCode = match[1];
      const found = languages.find(l => l.googleCode === langCode);
      if (found) return found;
    }

    return languages[0]; // Default Italian
  }, []);

  // Initialize on mount
  useEffect(() => {
    const detected = detectCurrentLanguage();
    setCurrentLang(detected);

    // Check if Google Translate is ready
    const checkReady = () => {
      const translateElement = document.getElementById('google_translate_element');
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;

      if (translateElement && select) {
        setIsTranslateReady(true);
        return true;
      }
      return false;
    };

    // Listen for Google Translate ready event
    const handleReady = () => {
      setTimeout(checkReady, 500);
    };
    window.addEventListener('googleTranslateReady', handleReady);

    // Also poll for readiness (backup)
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 1000);

    // Stop polling after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      // Even if not ready, we can still use cookie-based translation
      setIsTranslateReady(true);
    }, 15000);

    return () => {
      window.removeEventListener('googleTranslateReady', handleReady);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [detectCurrentLanguage]);

  // Trigger translation - try DOM method first, then fallback to reload
  const triggerTranslation = useCallback((langCode: string) => {
    // Try the DOM method first
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select && select.options.length > 0) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));

      // Verify translation was applied after a short delay
      setTimeout(() => {
        const translated = document.querySelector('.goog-te-banner-frame') ||
                          document.querySelector('[lang]')?.getAttribute('lang')?.startsWith(langCode);
        if (!translated) {
          // Fallback: reload with cookie
          setGoogleTranslateCookie(langCode);
          window.location.reload();
        }
      }, 1000);
    } else {
      // No select element - use cookie and reload
      setGoogleTranslateCookie(langCode);
      window.location.reload();
    }
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    if (lang.googleCode === currentLang.googleCode) {
      setIsOpen(false);
      return;
    }

    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, lang.googleCode);

    if (lang.googleCode === 'it') {
      // Reset to Italian
      setGoogleTranslateCookie('it');
      localStorage.removeItem(STORAGE_KEY);

      // Try to use Google Translate's reset function first
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Always reload to ensure clean state for Italian
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Set cookie for other languages
    setGoogleTranslateCookie(lang.googleCode);

    // Trigger translation
    triggerTranslation(lang.googleCode);
  }, [currentLang.googleCode, triggerTranslation]);

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

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

// Clear all googtrans cookies
const clearCookies = () => {
  const hostname = window.location.hostname;
  ['', hostname, '.' + hostname, '.villamareblu.it', 'villamareblu.it'].forEach(domain => {
    ['/', ''].forEach(path => {
      const d = domain ? `; domain=${domain}` : '';
      const p = path ? `; path=${path}` : '; path=/';
      document.cookie = `googtrans=${p}${d}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    });
  });
};

// Set translation cookie
const setCookie = (lang: string) => {
  if (lang === 'it') {
    clearCookies();
    return;
  }
  const value = `/it/${lang}`;
  const exp = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
  const hostname = window.location.hostname;

  // Set on multiple domains
  document.cookie = `googtrans=${value}; expires=${exp}; path=/`;
  document.cookie = `googtrans=${value}; expires=${exp}; path=/; domain=${hostname}`;
  document.cookie = `googtrans=${value}; expires=${exp}; path=/; domain=.${hostname}`;
};

// Try to trigger translation via DOM
const triggerDOMTranslation = (lang: string): boolean => {
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (select) {
    if (lang === 'it') {
      // Reset to original
      const frame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
      if (frame?.contentDocument) {
        const restoreBtn = frame.contentDocument.querySelector('button.goog-te-banner-frame-close');
        if (restoreBtn) {
          (restoreBtn as HTMLButtonElement).click();
          return true;
        }
      }
      select.value = '';
    } else {
      select.value = lang;
    }
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
};

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = languages.find(l => l.googleCode === saved);
      if (found) setCurrentLang(found);
    }
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    if (lang.googleCode === currentLang.googleCode) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setCurrentLang(lang);

    // Update localStorage
    if (lang.googleCode === 'it') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, lang.googleCode);
    }

    // Set cookie
    setCookie(lang.googleCode);

    // Try DOM method first
    const domWorked = triggerDOMTranslation(lang.googleCode);

    // If DOM didn't work or for Italian, reload
    if (!domWorked || lang.googleCode === 'it') {
      setTimeout(() => window.location.reload(), 100);
    }
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

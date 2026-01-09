import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
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

const STORAGE_KEY = 'villamareblu_language';

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
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = languages.find(l => l.gtCode === saved);
        if (found) return found;
      }
    }
    return languages[0];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isGTranslateReady, setIsGTranslateReady] = useState(false);
  const isChangingLanguage = useRef(false);

  // Check if GTranslate is ready
  useEffect(() => {
    const checkReady = () => {
      if (typeof window.doGTranslate === 'function') {
        setIsGTranslateReady(true);

        // If we have a saved language different from Italian, apply it
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== 'it' && !isChangingLanguage.current) {
          isChangingLanguage.current = true;
          setTimeout(() => {
            window.doGTranslate?.(`it|${saved}`);
            isChangingLanguage.current = false;
          }, 500);
        }
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    if (isChangingLanguage.current) return;

    isChangingLanguage.current = true;
    setCurrentLang(lang);
    setIsOpen(false);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, lang.gtCode);

    if (lang.gtCode === 'it') {
      // Reset to Italian - clear cookies and reload
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      window.location.reload();
      return;
    }

    // Try to use GTranslate's doGTranslate function
    if (typeof window.doGTranslate === 'function') {
      window.doGTranslate(`it|${lang.gtCode}`);
      // Give GTranslate time to apply
      setTimeout(() => {
        isChangingLanguage.current = false;
      }, 2000);
    } else {
      // Fallback: Set cookies and reload
      const cookieValue = `/it/${lang.gtCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;
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

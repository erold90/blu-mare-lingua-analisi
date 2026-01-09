import * as React from "react";
import { useState, useEffect } from "react";
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

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Detect current language from GTranslate cookie on mount
  useEffect(() => {
    const detectLanguage = () => {
      // Check GTranslate cookie
      const match = document.cookie.match(/googtrans=\/[a-z]{2}\/([a-z]{2})/);
      if (match) {
        const langCode = match[1];
        const found = languages.find(l => l.gtCode === langCode);
        if (found) {
          setCurrentLang(found);
          return;
        }
      }

      // Check URL for language parameter
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang) {
        const found = languages.find(l => l.gtCode === urlLang);
        if (found) {
          setCurrentLang(found);
          return;
        }
      }
    };

    detectLanguage();

    // Check periodically for GTranslate changes
    const interval = setInterval(detectLanguage, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);

    // Call GTranslate function if available
    if (typeof (window as any).doGTranslate === 'function') {
      (window as any).doGTranslate(`it|${lang.gtCode}`);
    } else {
      // Fallback: set cookie and reload
      const domain = window.location.hostname;
      document.cookie = `googtrans=/it/${lang.gtCode}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/it/${lang.gtCode}; path=/`;
      window.location.reload();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-2 h-8 text-muted-foreground hover:text-foreground transition-colors"
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

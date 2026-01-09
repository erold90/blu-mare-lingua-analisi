import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { open } = useSidebar();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10; // Minimo scroll per attivare hide/show

  // Track scroll position and direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determina se siamo scrollati
      setIsScrolled(currentScrollY > 50);

      // Determina la direzione dello scroll
      const scrollDiff = currentScrollY - lastScrollY.current;

      // Se siamo in cima alla pagina, mostra sempre l'header
      if (currentScrollY < 100) {
        setIsVisible(true);
      }
      // Se scrolliamo verso il basso di più di threshold, nascondi
      else if (scrollDiff > scrollThreshold) {
        setIsVisible(false);
      }
      // Se scrolliamo verso l'alto di più di threshold, mostra
      else if (scrollDiff < -scrollThreshold) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Non renderizzare l'header nell'area admin
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/area-riservata')) {
    return null;
  }

  // Animated values based on scroll
  const headerHeight = isMobile ? (isScrolled ? 44 : 48) : (isScrolled ? 52 : 64);
  const logoScale = isScrolled ? 0.9 : 1;

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -headerHeight - 10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-background/98 backdrop-blur-lg shadow-sm border-border"
          : "bg-background/80 backdrop-blur-md border-transparent"
      }`}
      style={{ height: headerHeight }}
    >
      <div
        className={`container flex items-center justify-between h-full transition-all duration-300 ${
          isMobile ? "px-4" : "px-6"
        }`}
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarTrigger />
          </motion.div>
          <motion.div
            className="hidden sm:block"
            animate={{ scale: logoScale }}
            transition={{ duration: 0.3 }}
          >
            <h1 className={`font-semibold transition-all duration-300 ${
              isScrolled ? "text-base" : "text-lg"
            }`}>
              Villa MareBlu
            </h1>
          </motion.div>
        </div>
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LanguageSelector />
        </motion.div>
      </div>
    </motion.header>
  );
}


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    
    // Only show the banner if user hasn't consented yet
    if (!hasConsented) {
      // Small delay to prevent banner from showing immediately on page load
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Save consent in localStorage
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    // Even when declining, we save a preference to not show the banner again
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 md:right-auto md:w-96 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border z-50",
      "transform transition-transform duration-300 ease-in-out"
    )}>
      <div className="flex items-start gap-3">
        <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm mb-2">
            Questo sito utilizza cookie per migliorare la tua esperienza. 
            Leggi la nostra <Link to="/cookie-policy" className="text-primary underline">Cookie Policy</Link> per saperne di più.
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              Solo essenziali
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Accetta tutti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

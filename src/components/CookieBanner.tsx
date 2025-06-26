
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/contexts/CookieContext";

export const CookieBanner: React.FC = () => {
  const { showBanner, acceptAll, acceptNecessaryOnly, openCustomization } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary shadow-2xl">
      <div className="container mx-auto p-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Gestione Cookie</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Utilizziamo cookie tecnici necessari e cookie di terze parti per migliorare la tua esperienza di navigazione e per analizzare il traffico del sito.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={acceptAll} 
                  className="bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  Accetta tutti
                </Button>
                <Button 
                  onClick={openCustomization} 
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Personalizza
                </Button>
                <Button 
                  onClick={acceptNecessaryOnly} 
                  variant="outline"
                  size="sm"
                  className="border-gray-400 text-gray-600 hover:bg-gray-50"
                >
                  Solo necessari
                </Button>
              </div>
              <Link 
                to="/cookie-policy" 
                className="text-sm text-primary underline hover:text-primary/80"
              >
                Cookie Policy completa
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CookieConsentProps {
  onAccept: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Utilizzo dei Cookie</CardTitle>
          <CardDescription className="text-sm">
            Utilizziamo cookie per migliorare la tua esperienza di navigazione e per analizzare il traffico del sito.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={onAccept} className="w-full">
            Accetta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

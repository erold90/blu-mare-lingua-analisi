
import * as React from "react";
import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const LocationSection = () => {
  return (
    <div className="bg-primary/5 py-10">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">La Nostra Posizione</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <Card className="h-full shadow-sm">
              <CardContent className="p-5 md:p-8">
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Via Marco Polo 112, Patù (LE), Salento, Puglia - A soli 150 metri dal mare con accesso privato su scogliera bassa.
                  </p>
                </div>
                <p className="text-muted-foreground mb-4">
                  Villa MareBlu si trova in una posizione privilegiata, tra le località di Torre Vado e Santa Maria di Leuca, nel cuore del Salento.
                </p>
                <p className="text-muted-foreground mb-4">
                  La zona offre tutti i servizi essenziali: ristoranti, market, farmacia e attività ricreative, facilmente raggiungibili in pochi minuti di auto.
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://maps.app.goo.gl/MSrp991xGGpaPhdM8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Indicazioni stradali
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 h-64 md:h-auto rounded-lg overflow-hidden shadow-sm">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2286008529195!2d18.293381700000002!3d39.8234857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13442aef4bc92ee3%3A0xc5a77b4b7764eed3!2sVilla%20MareBlu!5e0!3m2!1sit!2sit!4v1716927634793!5m2!1sit!2sit" 
              className="w-full h-full border-0" 
              loading="lazy"
              title="Mappa di Villa MareBlu"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

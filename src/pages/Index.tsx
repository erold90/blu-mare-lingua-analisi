import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Wifi, Car, Coffee, UtensilsCrossed, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section - Enhanced for mobile */}
      <div className="relative w-full">
        <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[70vh]"} relative overflow-hidden`}>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: `url('${siteSettings.heroImage}')`}}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className={`absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center ${isMobile ? "pt-16" : ""}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Villa MareBlu</h1>
            <p className="text-lg md:text-xl mb-8 max-w-md">La tua vacanza da sogno sul mare cristallino del Salento</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
              <Button size="lg" className="w-full" asChild>
                <Link to="/appartamenti">I Nostri Appartamenti</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full bg-white/20 backdrop-blur-sm" asChild>
                <Link to="/preventivo">Richiedi Preventivo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Introduzione - Better spacing */}
      <div className="container px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">Benvenuti a Villa MareBlu</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-base md:text-lg text-muted-foreground mb-5">
            Situati nel pittoresco Sud del Salento, i nostri appartamenti offrono il rifugio ideale per una fuga tranquilla. Ogni dettaglio è curato per massimo comfort e stile.
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            I terrazzi spaziosi regalano panorami mozzafiato sul Mar Ionio, permettendo di godere della brezza marina e ammirare le sfumature di blu nel cielo. Albe e tramonti diventano spettacoli naturali da ammirare comodamente dal vostro rifugio.
          </p>
        </div>
      </div>
      
      {/* Posizione - Improved for mobile with card layout */}
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
                      Via Marco Polo 112, Patù (LE), Salento, Puglia - A soli 100 metri dal mare con accesso privato su scogliera bassa.
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2286008529195!2d18.29282087704548!3d39.82353447131548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13442aef4bc92ee3%3A0xc5a77b4b7764eed3!2sVia%20Marco%20Polo%2C%20112%2C%2073053%20Pat%C3%B9%20LE!5e0!3m2!1sit!2sit!4v1716927634793!5m2!1sit!2sit" 
                className="w-full h-full border-0" 
                loading="lazy"
                title="Mappa di Villa MareBlu"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Servizi e Vantaggi - Improved grid for mobile */}
      <div className="container px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">I Nostri Servizi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
                <Wifi className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Wi-Fi Gratuito</h3>
              <p className="text-muted-foreground">Connessione Wi-Fi gratuita disponibile in tutta la struttura.</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
                <Car className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Parcheggio Privato</h3>
              <p className="text-muted-foreground">Parcheggio privato e sicuro incluso per ogni appartamento.</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
                <Coffee className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Zona Relax</h3>
              <p className="text-muted-foreground">Ampie terrazze con vista mare per momenti di piacevole relax.</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Cucina Attrezzata</h3>
              <p className="text-muted-foreground">Ogni appartamento dispone di una cucina completamente attrezzata.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Caratteristiche aggiuntive - Improved carousel for mobile */}
      <div className="bg-primary/5 py-14">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center">L'Esperienza Villa MareBlu</h2>
          
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              <CarouselItem>
                <Card className="border-0 shadow-lg overflow-hidden bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-56 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')" }}></div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <h3 className="text-xl font-medium mb-4">Spiagge da Sogno</h3>
                      <p className="text-muted-foreground">
                        A soli 100 metri dalla nostra struttura, troverete l'accesso privato al mare cristallino del Salento.
                        Acque turchesi, scogliere basse e insenature nascoste vi attendono per giornate di puro relax al sole.
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
              
              <CarouselItem>
                <Card className="border-0 shadow-lg overflow-hidden bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-56 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')" }}></div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <h3 className="text-xl font-medium mb-4">Relax e Divertimento</h3>
                      <p className="text-muted-foreground">
                        Nelle vicine località di Torre Vado e Santa Maria di Leuca, troverete spiagge attrezzate, ristoranti tipici 
                        e un'animata vita notturna per rendere la vostra vacanza indimenticabile.
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
              
              <CarouselItem>
                <Card className="border-0 shadow-lg overflow-hidden bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-56 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605215811803-1b8c81a96a74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')" }}></div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <h3 className="text-xl font-medium mb-4">Esperienze Uniche</h3>
                      <p className="text-muted-foreground">
                        La nostra struttura vi offre convenzioni speciali per escursioni in barca 
                        alle famose grotte marine e l'accesso privilegiato ai migliori lidi della costa salentina.
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
              
              <CarouselItem>
                <Card className="border-0 shadow-lg overflow-hidden bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-56 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')" }}></div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <h3 className="text-xl font-medium mb-4">Comfort All'Aperto</h3>
                      <p className="text-muted-foreground">
                        Godetevi le ampie aree esterne con barbecue, forno a legna e zone relax arredate con eleganti 
                        sedute. Cene all'aperto con vista sul mare e brezza marina, per vivere il Salento in tutto il suo splendore.
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="relative static mx-2 transform-none" />
              <CarouselNext className="relative static mx-2 transform-none" />
            </div>
          </Carousel>
        </div>
      </div>
      
      {/* CTA Section - Improved for mobile */}
      <div className="py-14 bg-primary/5">
        <div className="container px-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Pronto per prenotare la tua vacanza?</h2>
                  <p className="text-muted-foreground">Contattaci oggi per disponibilità e offerte speciali.</p>
                </div>
                <Button size="lg" className="w-full md:w-auto" asChild>
                  <Link to="/preventivo">Richiedi un Preventivo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

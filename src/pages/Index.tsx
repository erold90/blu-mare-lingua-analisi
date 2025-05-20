
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Wifi, Car, Coffee, UtensilsCrossed } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[30vh] md:h-[60vh] bg-blue-200 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://www.villamareblu.it/wp-content/uploads/2024/01/esterno5-scaled.jpg')"}}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Villa Mare Blu</h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl">La tua vacanza da sogno sul mare cristallino della Sardegna</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/appartamenti">I Nostri Appartamenti</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm" asChild>
                <Link to="/preventivo">Richiedi Preventivo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Introduzione */}
      <div className="container px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">Benvenuti a Villa Mare Blu</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Villa Mare Blu è un'elegante struttura situata a Torre delle Stelle, direttamente sul mare cristallino della costa sud-orientale della Sardegna.
          </p>
          <p className="text-lg text-muted-foreground">
            La villa offre quattro confortevoli appartamenti, ciascuno con accesso indipendente e vista mozzafiato sul Mediterraneo, per una vacanza all'insegna del relax e del benessere.
          </p>
        </div>
      </div>
      
      {/* Posizione */}
      <div className="bg-primary/5 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">La Nostra Posizione</h2>
              <div className="flex items-start space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Torre delle Stelle, Maracalagonis (CA), Sardegna - A soli 35 km da Cagliari e 20 minuti dall'aeroporto internazionale.
                </p>
              </div>
              <p className="text-muted-foreground mb-4">
                La villa gode di una posizione privilegiata, con accesso diretto alla spiaggia di Genn'e Mari e a breve distanza dalla spiaggia di Cann'e Sisa, due delle più belle calette della zona.
              </p>
              <p className="text-muted-foreground">
                Il centro abitato di Torre delle Stelle offre tutti i servizi essenziali: ristoranti, market, farmacia e attività ricreative, facilmente raggiungibili a piedi.
              </p>
            </div>
            <div className="flex-1 h-64 md:h-80 w-full rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12286.858187875444!2d9.400768617837902!3d39.179621764766895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e73189ab7c73d9%3A0xe243f78fe914c7cd!2sTorre%20delle%20Stelle%2C%2009040%20Maracalagonis%20CA!5e0!3m2!1sit!2sit!4v1644234965647!5m2!1sit!2sit" 
                className="w-full h-full border-0" 
                loading="lazy"
                title="Mappa di Villa Mare Blu"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Servizi */}
      <div className="container px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">I Nostri Servizi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
              <Wifi className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Wi-Fi Gratuito</h3>
            <p className="text-muted-foreground">Connessione Wi-Fi gratuita disponibile in tutta la struttura.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
              <Car className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Parcheggio Privato</h3>
            <p className="text-muted-foreground">Parcheggio privato e sicuro incluso per ogni appartamento.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
              <Coffee className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Zona Relax</h3>
            <p className="text-muted-foreground">Ampie terrazze con vista mare per momenti di piacevole relax.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
              <UtensilsCrossed className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Cucina Attrezzata</h3>
            <p className="text-muted-foreground">Ogni appartamento dispone di una cucina completamente attrezzata.</p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary/5 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Pronto per prenotare la tua vacanza?</h2>
              <p className="text-muted-foreground">Contattaci oggi per disponibilità e offerte speciali.</p>
            </div>
            <Button size="lg" asChild>
              <Link to="/preventivo">Richiedi un Preventivo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

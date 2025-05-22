
import * as React from "react";
import { Separator } from "@/components/ui/separator";

export const IntroductionSection = () => {
  return (
    <div className="container px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-6">Benvenuti a Villa MareBlu</h2>
        <div className="flex justify-center mb-6">
          <Separator className="w-24 h-1 bg-primary/30" />
        </div>
        <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
          Situati nel pittoresco Sud del Salento, i nostri appartamenti offrono il rifugio ideale per una fuga tranquilla. Ogni dettaglio è curato per massimo comfort e stile.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          I terrazzi spaziosi regalano panorami mozzafiato sul Mar Ionio, permettendo di godere della brezza marina e ammirare le sfumature di blu nel cielo. Albe e tramonti diventano spettacoli naturali da ammirare comodamente dal vostro rifugio.
        </p>
      </div>
    </div>
  );
};

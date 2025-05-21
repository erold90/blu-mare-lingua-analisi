
import * as React from "react";

export const IntroductionSection = () => {
  return (
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
  );
};


import React from "react";

export const WhyChooseSection: React.FC = () => {
  return (
    <div className="mt-16 bg-primary/5 p-8 rounded-lg">
      <h2 className="text-3xl font-serif font-semibold mb-6 text-center text-primary">
        Perché Scegliere Villa MareBlu
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🏖️</div>
          <h3 className="text-xl font-semibold mb-3">Posizione Privilegiata</h3>
          <p className="text-muted-foreground">
            A soli 150 metri dalle splendide spiagge di Torre Vado, nel cuore del Salento
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold mb-3">Servizi di Qualità</h3>
          <p className="text-muted-foreground">
            Giardino mediterraneo e tutti i comfort per una vacanza perfetta
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-3">Esperienza Personalizzata</h3>
          <p className="text-muted-foreground">
            Staff dedicato e servizi su misura per rendere unica la tua vacanza in Puglia
          </p>
        </div>
      </div>
    </div>
  );
};

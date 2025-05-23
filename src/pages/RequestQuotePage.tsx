
import React, { useEffect } from "react";

console.log("🚀 RequestQuotePage: Component file loaded");

const RequestQuotePage = () => {
  console.log("🚀 RequestQuotePage: Component rendering started");
  
  useEffect(() => {
    console.log("✅ RequestQuotePage mounted successfully");
    return () => console.log("👋 RequestQuotePage unmounted");
  }, []);
  
  return (
    <div className="bg-gradient-to-b from-white to-secondary/30 min-h-screen">
      <div className="container px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-primary">
            Richiedi un Preventivo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compila il form per ricevere un preventivo personalizzato per il tuo soggiorno.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-center text-lg">
              Pagina del preventivo caricata correttamente! 🎉
            </p>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Il form sarà implementato nei prossimi step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;

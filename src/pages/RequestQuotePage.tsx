
import React from "react";

console.log("🚀 RequestQuotePage: Component file loaded - SIMPLIFIED VERSION");

const RequestQuotePage = () => {
  console.log("🚀 RequestQuotePage: Component rendering started - SIMPLE");
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Richiedi un Preventivo
            </h1>
            <p className="text-xl text-gray-600">
              La pagina funziona correttamente! 🎉
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Pagina Preventivo Caricata</h2>
              <p className="text-gray-600 mb-6">
                Il routing verso /preventivo funziona perfettamente.
              </p>
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ Componente RequestQuotePage renderizzato con successo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;

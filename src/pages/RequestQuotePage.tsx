
import React, { useEffect } from "react";

console.log("🚀 RequestQuotePage: Component file loaded - ENHANCED DEBUG VERSION");

const RequestQuotePage = () => {
  console.log("🚀 RequestQuotePage: Component rendering started - ENHANCED DEBUG");
  
  useEffect(() => {
    console.log("✅ RequestQuotePage: useEffect executed - Component mounted successfully!");
    console.log("📍 Current URL:", window.location.href);
    console.log("📍 Current pathname:", window.location.pathname);
    
    return () => {
      console.log("👋 RequestQuotePage: Component unmounted");
    };
  }, []);
  
  // Log before render
  React.useEffect(() => {
    console.log("🎨 RequestQuotePage: JSX rendering");
  });
  
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
              <div className="mt-4 text-sm text-gray-500">
                <p>URL corrente: {window.location.pathname}</p>
                <p>Timestamp: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;

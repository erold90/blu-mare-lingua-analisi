
import React from "react";

const RequestQuotePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Richiedi un Preventivo
            </h1>
            <p className="text-xl text-gray-600">
              Compila il form per ricevere il tuo preventivo personalizzato
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Form di Richiesta</h2>
              <p className="text-gray-600 mb-6">
                Qui andrà il form per la richiesta del preventivo.
              </p>
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                ✅ Pagina Preventivo caricata correttamente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;

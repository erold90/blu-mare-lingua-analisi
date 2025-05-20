
import * as React from "react";

const AboutPage = () => {
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">La Villa</h1>
        
        <div className="w-full h-64 md:h-96 bg-blue-200 mb-6 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}
          />
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-4">
            Villa Mare Blu è una splendida villa sul mare situata in una delle zone più belle della Sardegna.
            Con il suo design elegante e le sue ampie terrazze vista mare, offre un'esperienza di soggiorno indimenticabile.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">La Storia</h2>
          <p>
            Costruita negli anni '70 e completamente ristrutturata nel 2020, Villa Mare Blu conserva il fascino dell'architettura mediterranea
            tradizionale, combinato con tutti i comfort moderni che ci si aspetta da una residenza di lusso.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Gli Spazi</h2>
          <p>
            La villa si sviluppa su due livelli e può ospitare comodamente fino a 8 persone. Dispone di:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>4 camere da letto spaziose e luminose</li>
            <li>3 bagni completi con finiture di pregio</li>
            <li>Ampio soggiorno con vista mare</li>
            <li>Cucina completamente attrezzata</li>
            <li>Terrazza panoramica di 80 mq</li>
            <li>Giardino mediterraneo di 300 mq</li>
            <li>Piscina privata a sfioro</li>
            <li>Area barbecue e zona pranzo esterna</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">La Posizione</h2>
          <p>
            Villa Mare Blu si trova a soli 100 metri dalla spiaggia, in una tranquilla baia riparata.
            La posizione è ideale per godersi il mare e il sole, ma anche per esplorare le bellezze naturali e culturali della Sardegna.
          </p>
          <p>
            A pochi minuti di auto si trovano ristoranti, negozi, e attrazioni turistiche.
            La città principale più vicina è raggiungibile in 15 minuti di auto.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

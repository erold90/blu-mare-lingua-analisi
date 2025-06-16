
import * as React from "react";
import SEOHead from "@/components/seo/SEOHead";
import { getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

const AboutPage = () => {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "La Villa", url: "/la-villa" }
  ];

  const structuredData = [getBreadcrumbSchema(breadcrumbItems)];

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="La Villa MareBlu Salento - Storia e Comfort | Villa Fronte Mare Torre Vado Puglia"
        description="Scopri la storia di Villa MareBlu: villa fronte mare completamente ristrutturata nel 2020, dove dormire in Salento in una delle migliori case vacanze Puglia. Eleganza e tradizione mediterranea."
        keywords={getPageSpecificKeywords('about')}
        canonicalUrl="/la-villa"
        structuredData={structuredData}
        ogTitle="La Villa MareBlu - Storia e Comfort sul Mare del Salento"
        ogDescription="Una villa storica completamente rinnovata che unisce tradizione mediterranea e comfort moderni nel cuore del Salento"
      />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">La Villa MareBlu Salento</h1>
        
        <div className="w-full h-64 md:h-96 bg-blue-200 mb-6 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}
            role="img"
            aria-label="Villa MareBlu - Vista esterna della villa fronte mare in Salento"
          />
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-4">
            Villa MareBlu è una splendida <strong>villa fronte mare</strong> situata in una delle zone più belle del Salento, Puglia.
            Con il suo design elegante e le sue ampie terrazze vista mare, offre un'esperienza di soggiorno indimenticabile 
            per chi cerca <strong>dove dormire in Salento mare</strong> in una delle <strong>migliori case vacanze Puglia</strong>.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">La Storia della Nostra Villa</h2>
          <p>
            Costruita negli anni '70 e completamente ristrutturata nel 2020, Villa MareBlu conserva il fascino dell'architettura mediterranea
            tradizionale, combinato con tutti i comfort moderni che ci si aspetta da una <strong>villa lusso Salento mare</strong>.
            La nostra <strong>casa vacanze Torre Vado</strong> rappresenta l'equilibrio perfetto tra storia e innovazione.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Gli Spazi della Villa</h2>
          <p>
            La <strong>villa con giardino Salento</strong> si sviluppa su due livelli e può ospitare comodamente fino a 8 persone. 
            I nostri <strong>appartamenti 4 persone Puglia</strong> sono perfetti per famiglie e gruppi di amici. Dispone di:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>4 camere da letto spaziose e luminose con vista mare</li>
            <li>3 bagni completi con finiture di pregio</li>
            <li>Ampio soggiorno con vista panoramica sul mare del Salento</li>
            <li>Cucina completamente attrezzata per <strong>casa vacanze bambini Puglia</strong></li>
            <li>Terrazza panoramica di 80 mq perfetta per <strong>weekend romantico Salento</strong></li>
            <li>Giardino mediterraneo di 300 mq con piante autoctone</li>
            <li>Piscina privata a sfioro con vista mare</li>
            <li>Area barbecue e zona pranzo esterna per <strong>vacanze gruppo amici Salento</strong></li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">La Posizione Strategica nel Salento</h2>
          <p>
            Villa MareBlu si trova a soli 100 metri dalla spiaggia di Torre Vado, in una tranquilla baia riparata del Salento.
            La posizione è ideale per chi cerca <strong>casa vacanze vicino spiaggia</strong> e vuole godersi il mare cristallino della Puglia.
            La nostra <strong>villa fronte mare</strong> è perfetta per esplorare le bellezze naturali e culturali del Salento.
          </p>
          <p>
            A pochi minuti di auto si trovano ristoranti tipici pugliesi, negozi di prodotti locali e le principali attrazioni turistiche del Salento.
            Santa Maria di Leuca, il punto più meridionale della Puglia, è raggiungibile in soli 15 minuti di auto.
            La nostra posizione privilegiata rende Villa MareBlu una delle <strong>migliori case vacanze Puglia</strong> per esplorare tutto il territorio.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Perché Scegliere Villa MareBlu</h2>
          <p>
            Se stai cercando <strong>dove dormire Salento mare</strong> in un ambiente di lusso e comfort, Villa MareBlu rappresenta 
            la scelta ideale. La nostra <strong>villa con piscina Puglia</strong> offre privacy, eleganza e tutti i servizi necessari 
            per una <strong>vacanza famiglia Puglia</strong> indimenticabile o per un <strong>weekend romantico Salento</strong> da sogno.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

import * as React from "react";
import SEOHead from "@/components/seo/SEOHead";
import { getBreadcrumbSchema, getFAQSchemaForPage } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";
import { Home, Users, MapPin, Waves } from "lucide-react";
import FAQSection from "@/components/faq/FAQSection";
import { aboutFAQs } from "@/data/faqData";

const AboutPage = () => {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Chi Siamo", url: "/chi-siamo" }
  ];

  const structuredData = [getBreadcrumbSchema(breadcrumbItems), getFAQSchemaForPage('about')];

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Chi Siamo - Villa MareBlu | Casa Vacanze 100m dal Mare Torre Vado | Tra Pescoluse e Leuca"
        description="Villa MareBlu Torre Vado: 4 appartamenti vista mare per 23 ospiti, a 100 metri dal mare. Tra Pescoluse (Maldive del Salento) e Santa Maria di Leuca. Parcheggio privato, giardino, animali ammessi."
        keywords={getPageSpecificKeywords('about')}
        canonicalUrl="/chi-siamo"
        structuredData={structuredData}
        ogTitle="Chi Siamo - Villa MareBlu Torre Vado"
        ogDescription="4 appartamenti vista mare nel cuore del Salento, tra Torre Vado e Santa Maria di Leuca"
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Villa MareBlu</h1>

        <div className="w-full h-64 md:h-96 bg-blue-200 mb-8 rounded-lg overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{backgroundImage: "url('/images/hero/hero.jpg')"}}
            role="img"
            aria-label="Villa MareBlu - Vista della struttura a Torre Vado, Salento"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6 leading-relaxed">
            Villa MareBlu è una struttura ricettiva situata a <strong>Torre Vado</strong>, nel comune di Patù,
            nel cuore del <strong>Salento</strong>. A soli 100 metri dal mare con accesso privato su scogliera bassa,
            offriamo <strong>4 appartamenti indipendenti</strong> per un totale di <strong>23 posti letto</strong>,
            ideali per famiglie, gruppi di amici o più nuclei familiari che desiderano trascorrere le vacanze insieme
            mantenendo la propria privacy.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10 not-prose">
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <Home className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Appartamenti</div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">23</div>
              <div className="text-sm text-muted-foreground">Posti letto</div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <Waves className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">100m</div>
              <div className="text-sm text-muted-foreground">Dal mare</div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">15 min</div>
              <div className="text-sm text-muted-foreground">Da Leuca</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">I Nostri Appartamenti</h2>
          <p className="mb-4">
            La struttura si sviluppa su due livelli, con appartamenti al piano terra e al primo piano,
            ciascuno con ingresso indipendente e spazi esterni privati:
          </p>

          <div className="not-prose space-y-4 mb-8">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Appartamento 1 <span className="text-primary">(6 posti)</span></h3>
              <p className="text-muted-foreground text-sm">
                Piano terra con ampia veranda coperta. Due camere da letto, soggiorno con angolo cottura,
                vista mare. Naturalmente fresco grazie alla posizione.
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Appartamento 2 <span className="text-primary">(8 posti)</span></h3>
              <p className="text-muted-foreground text-sm">
                Primo piano con terrazzo panoramico. Tre camere da letto, soggiorno con angolo cottura,
                aria condizionata, vista mare mozzafiato.
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Appartamento 3 <span className="text-primary">(4 posti)</span></h3>
              <p className="text-muted-foreground text-sm">
                Piano terra con terrazzo vista mare. Una camera da letto, soggiorno con angolo cottura,
                aria condizionata. Perfetto per coppie o piccole famiglie.
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Appartamento 4 <span className="text-primary">(5 posti)</span></h3>
              <p className="text-muted-foreground text-sm">
                Primo piano con zona esterna privata e tettoia. Due camere da letto, soggiorno con angolo cottura,
                aria condizionata, vista panoramica.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Servizi Inclusi</h2>
          <p className="mb-4">
            Ogni appartamento è dotato di tutto il necessario per un soggiorno confortevole:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Wi-Fi gratuito</strong> ad alta velocità in tutta la struttura</li>
            <li><strong>Parcheggio privato</strong> gratuito per ogni appartamento</li>
            <li><strong>Cucina completamente attrezzata</strong> con frigorifero, fornelli, forno e utensili</li>
            <li><strong>Terrazza o veranda privata</strong> con tavolo, sedie e sdraio</li>
            <li><strong>Doccia esterna</strong> per rinfrescarsi dopo il mare</li>
            <li><strong>Area barbecue</strong> condivisa</li>
            <li><strong>TV</strong> in ogni appartamento</li>
            <li><strong>Biancheria da letto e bagno</strong> disponibile su richiesta</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">La Posizione</h2>
          <p className="mb-4">
            Villa MareBlu si trova in <strong>Via Marco Polo 112, Patù (LE)</strong>, in una posizione strategica
            tra Torre Vado e Santa Maria di Leuca. La costa è raggiungibile in pochi passi attraverso un accesso
            privato su scogliera bassa, perfetta per tuffi e snorkeling nelle acque cristalline del Mar Ionio.
          </p>
          <p className="mb-4">
            <strong>Nelle vicinanze:</strong>
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Torre Vado</strong> - spiaggia attrezzata a 5 minuti di auto</li>
            <li><strong>Pescoluse</strong> (Maldive del Salento) - 10 minuti di auto</li>
            <li><strong>Santa Maria di Leuca</strong> - 15 minuti di auto</li>
            <li><strong>Gallipoli</strong> - 40 minuti di auto</li>
            <li>Ristoranti, supermercati, farmacia - tutti raggiungibili in pochi minuti</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Perché Scegliere Villa MareBlu</h2>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Prenotazione diretta</strong> - nessuna commissione, miglior prezzo garantito</li>
            <li><strong>Flessibilità</strong> - possibilità di prenotare da 1 a 4 appartamenti</li>
            <li><strong>Privacy</strong> - ogni appartamento è completamente indipendente</li>
            <li><strong>Posizione unica</strong> - mare a 100 metri, tranquillità garantita</li>
            <li><strong>Assistenza dedicata</strong> - risposta entro 2 ore, supporto durante il soggiorno</li>
            <li><strong>Animali ammessi</strong> - i vostri amici a quattro zampe sono i benvenuti</li>
          </ul>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <p className="text-center mb-0">
              <strong>Contattaci per un preventivo personalizzato:</strong><br />
              Tel: <a href="tel:+393780038730" className="text-primary hover:underline">+39 378 0038730</a><br />
              Email: <a href="mailto:macchiaforcato@gmail.com" className="text-primary hover:underline">macchiaforcato@gmail.com</a>
            </p>
          </div>
        </div>
      </div>

      <FAQSection
        faqs={aboutFAQs}
        title="Scopri il Salento"
        subtitle="Informazioni su Torre Vado, le spiagge e il territorio"
      />
    </div>
  );
};

export default AboutPage;

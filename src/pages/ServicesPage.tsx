
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEOHead from "@/components/seo/SEOHead";
import { getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

const ServicesPage = () => {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Servizi", url: "/servizi" }
  ];

  const structuredData = [getBreadcrumbSchema(breadcrumbItems)];

  const services = [
    {
      title: "Pulizia Quotidiana",
      description: "La villa viene pulita quotidianamente da personale professionale specializzato in case vacanze di lusso.",
      icon: "🧹"
    },
    {
      title: "Colazione Inclusa",
      description: "Ogni mattina ti aspetta una ricca colazione con prodotti locali freschi del Salento e specialità pugliesi.",
      icon: "🥐"
    },
    {
      title: "Wi-Fi Gratuito",
      description: "Connessione Wi-Fi ad alta velocità disponibile in tutta la villa per rimanere sempre connessi.",
      icon: "📶"
    },
    {
      title: "Parcheggio Privato",
      description: "Parcheggio privato sicuro e gratuito per gli ospiti della villa, ideale per esplorare il Salento.",
      icon: "🚗"
    },
    {
      title: "Piscina Privata",
      description: "Piscina a sfioro con vista sul mare, lettini, ombrelloni e area relax esclusiva.",
      icon: "🏊‍♂️"
    },
    {
      title: "Servizio Concierge",
      description: "Il nostro staff è a disposizione per aiutarti con prenotazioni ristoranti e informazioni turistiche del Salento.",
      icon: "👨‍💼"
    },
    {
      title: "Transfer da/per Aeroporto",
      description: "Servizio di transfer privato disponibile su richiesta dall'aeroporto di Brindisi o Bari.",
      icon: "🚕"
    },
    {
      title: "Attrezzature da Spiaggia",
      description: "Ombrelloni, sedie e asciugamani da spiaggia forniti gratuitamente per le spiagge del Salento.",
      icon: "🏖️"
    },
    {
      title: "Attività e Tour",
      description: "Organizziamo escursioni personalizzate e attività su misura per scoprire le bellezze della Puglia.",
      icon: "🚢"
    }
  ];

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Servizi Villa MareBlu - Villa Lusso Salento Mare | Casa Vacanze Bambini Puglia"
        description="Scopri i servizi esclusivi di Villa MareBlu: villa lusso Salento mare con piscina privata, concierge, transfer, attrezzature spiaggia. Perfetta casa vacanze bambini Puglia con tutti i comfort."
        keywords={getPageSpecificKeywords('services')}
        canonicalUrl="/servizi"
        structuredData={structuredData}
        ogTitle="Servizi Esclusivi Villa MareBlu - Villa Lusso Salento"
        ogDescription="Servizi di lusso per la tua vacanza in Salento: piscina privata, concierge, transfer e tanto altro"
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-6">I Nostri Servizi Esclusivi</h1>
      <p className="text-lg mb-8">
        A Villa MareBlu, <strong>villa lusso Salento mare</strong>, ci impegniamo a rendere il tuo soggiorno il più confortevole e piacevole possibile.
        Ecco i servizi che offriamo per rendere la tua <strong>vacanza famiglia Puglia</strong> o il tuo <strong>weekend romantico Salento</strong> indimenticabile:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="text-3xl mb-2">{service.icon}</div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Servizi Personalizzati per la Tua Vacanza in Salento</h2>
        <p className="mb-4">
          Hai esigenze particolari per la tua <strong>casa vacanze bambini Puglia</strong> o per il tuo <strong>affitto settimanale Puglia</strong>? 
          Contattaci in anticipo e faremo del nostro meglio per soddisfare le tue richieste e rendere unica la tua esperienza nella nostra 
          <strong>villa lusso Salento mare</strong>.
        </p>
        <p className="font-medium">
          Alcuni servizi aggiuntivi potrebbero comportare costi extra. Per maggiori informazioni sui nostri servizi esclusivi 
          per <strong>vacanze famiglia Puglia</strong>, contatta il nostro staff specializzato.
        </p>
      </div>

      {/* Sezione aggiuntiva sui servizi stagionali */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Servizi Stagionali Speciali</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-800">Estate in Salento</h3>
            <p className="text-blue-700">
              Durante i mesi estivi, offriamo servizi aggiuntivi come noleggio biciclette, 
              escursioni in barca alle Grotte di Castro e tour guidati delle masserie storiche del Salento.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-800">Primavera e Autunno</h3>
            <p className="text-green-700">
              Nelle stagioni intermedie, organizziamo degustazioni di vini locali, 
              visite alle frantoi storici e tour enogastronomici alla scoperta dei sapori autentici della Puglia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

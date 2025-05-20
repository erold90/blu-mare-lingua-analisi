
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ServicesPage = () => {
  const services = [
    {
      title: "Pulizia Quotidiana",
      description: "La villa viene pulita quotidianamente da personale professionale.",
      icon: "🧹"
    },
    {
      title: "Colazione Inclusa",
      description: "Ogni mattina ti aspetta una ricca colazione con prodotti locali freschi.",
      icon: "🥐"
    },
    {
      title: "Wi-Fi Gratuito",
      description: "Connessione Wi-Fi ad alta velocità disponibile in tutta la struttura.",
      icon: "📶"
    },
    {
      title: "Parcheggio Privato",
      description: "Parcheggio privato sicuro e gratuito per gli ospiti della villa.",
      icon: "🚗"
    },
    {
      title: "Piscina Privata",
      description: "Piscina a sfioro con vista sul mare, lettini e ombrelloni.",
      icon: "🏊‍♂️"
    },
    {
      title: "Servizio Concierge",
      description: "Il nostro staff è a disposizione per aiutarti con prenotazioni e informazioni.",
      icon: "👨‍💼"
    },
    {
      title: "Transfer da/per Aeroporto",
      description: "Servizio di transfer privato disponibile su richiesta.",
      icon: "🚕"
    },
    {
      title: "Attrezzature da Spiaggia",
      description: "Ombrelloni, sedie e asciugamani da spiaggia forniti gratuitamente.",
      icon: "🏖️"
    },
    {
      title: "Attività e Tour",
      description: "Organizziamo escursioni e attività su misura per te.",
      icon: "🚢"
    }
  ];

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">I Nostri Servizi</h1>
      <p className="text-lg mb-8">
        A Villa Mare Blu, ci impegniamo a rendere il tuo soggiorno il più confortevole e piacevole possibile.
        Ecco i servizi che offriamo per rendere la tua vacanza indimenticabile:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="text-3xl mb-2">{service.icon}</div>
              <CardTitle>{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{service.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Servizi Personalizzati</h2>
        <p className="mb-4">
          Hai esigenze particolari? Contattaci in anticipo e faremo del nostro meglio per soddisfare le tue richieste.
        </p>
        <p className="font-medium">
          Alcuni servizi aggiuntivi potrebbero comportare costi extra. Per maggiori informazioni, contatta il nostro staff.
        </p>
      </div>
    </div>
  );
};

export default ServicesPage;

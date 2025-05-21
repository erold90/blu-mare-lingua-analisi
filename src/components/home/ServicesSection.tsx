
import * as React from "react";
import { Wifi, Car, Coffee, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <Card className="shadow-sm">
    <CardContent className="p-6 text-center">
      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const ServicesSection = () => {
  const services = [
    {
      icon: <Wifi className="h-7 w-7 text-primary" />,
      title: "Wi-Fi Gratuito",
      description: "Connessione Wi-Fi gratuita disponibile in tutta la struttura."
    },
    {
      icon: <Car className="h-7 w-7 text-primary" />,
      title: "Parcheggio Privato",
      description: "Parcheggio privato e sicuro incluso per ogni appartamento."
    },
    {
      icon: <Coffee className="h-7 w-7 text-primary" />,
      title: "Zona Relax",
      description: "Ampie terrazze con vista mare per momenti di piacevole relax."
    },
    {
      icon: <UtensilsCrossed className="h-7 w-7 text-primary" />,
      title: "Cucina Attrezzata",
      description: "Ogni appartamento dispone di una cucina completamente attrezzata."
    }
  ];

  return (
    <div className="container px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">I Nostri Servizi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <ServiceCard 
            key={index} 
            icon={service.icon} 
            title={service.title} 
            description={service.description} 
          />
        ))}
      </div>
    </div>
  );
};

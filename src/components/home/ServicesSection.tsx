
import * as React from "react";
import { Wifi, Car, Coffee, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <Card className="shadow-md border-0 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
    <CardContent className="p-8 text-center">
      <div className="mx-auto mb-5 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium mb-3 text-primary">{title}</h3>
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
    <div className="bg-secondary/50 py-16 md:py-24">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center mb-4 text-primary">I Nostri Servizi</h2>
        <div className="flex justify-center mb-10">
          <div className="w-24 h-1 bg-primary/30"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
    </div>
  );
};

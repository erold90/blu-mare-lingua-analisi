
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Wifi, Car, Coffee, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  delay: number;
  isVisible: boolean;
}

const ServiceCard = ({ icon, title, description, delay, isVisible }: ServiceCardProps) => (
  <Card 
    className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardContent className="relative p-8 text-center">
      <div className="mx-auto mb-6 p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
        {icon}
      </div>
      
      <h3 className="text-xl font-serif font-semibold mb-4 text-primary group-hover:text-blue-600 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-muted-foreground leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
        {description}
      </p>
    </CardContent>
  </Card>
);

export const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <Wifi className="h-8 w-8 text-blue-600" />,
      title: "Wi-Fi Gratuito",
      description: "Connessione Wi-Fi ad alta velocità disponibile in tutta la struttura per rimanere sempre connessi."
    },
    {
      icon: <Car className="h-8 w-8 text-blue-600" />,
      title: "Parcheggio Privato",
      description: "Parcheggio privato e sicuro incluso per ogni appartamento, con accesso diretto alla struttura."
    },
    {
      icon: <Coffee className="h-8 w-8 text-blue-600" />,
      title: "Zona Relax",
      description: "Ampie terrazze panoramiche con vista mare per momenti di piacevole relax e contemplazione."
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8 text-blue-600" />,
      title: "Cucina Attrezzata",
      description: "Ogni appartamento dispone di una cucina moderna e completamente attrezzata per ogni esigenza."
    }
  ];

  return (
    <div 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-slate-50 via-blue-50/40 to-white py-24 md:py-32"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(59_130_246)_1px,_transparent_0)] bg-[length:50px_50px]" />
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-serif font-semibold mb-6 text-primary transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            I Nostri <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Servizi</span>
          </h2>
          
          <div className={`flex justify-center transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full shadow-lg" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              icon={service.icon} 
              title={service.title} 
              description={service.description}
              delay={index * 200}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

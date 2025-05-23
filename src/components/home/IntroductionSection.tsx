
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";

export const IntroductionSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-blue-50/30 to-white py-24 md:py-32 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-8 leading-tight">
              Benvenuti a 
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                Villa MareBlu
              </span>
            </h2>
          </div>
          
          <div className={`flex justify-center mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="relative">
              <Separator className="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className={`space-y-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              Situata nel <span className="font-medium text-primary">pittoresco Sud del Salento</span>, 
              la nostra villa offre il rifugio ideale per una fuga tranquilla. 
              Ogni dettaglio è curato per <span className="font-medium text-primary">massima tranquillità e comfort</span>.
            </p>
            
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto" />
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              I <span className="font-medium text-primary">terrazzi spaziosi</span> regalano panorami mozzafiato sul 
              <span className="font-medium text-blue-600"> Mar Ionio</span>, permettendo di godere della brezza marina 
              e ammirare le sfumature di blu nel cielo. 
              <span className="block mt-4 font-medium text-primary">
                Albe e tramonti diventano spettacoli naturali da ammirare comodamente dal vostro rifugio.
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Background decorative waves */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50/20 to-transparent" />
    </div>
  );
};

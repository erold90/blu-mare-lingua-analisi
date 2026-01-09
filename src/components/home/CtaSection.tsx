
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";

export const CtaSection = () => {
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
    <section className="py-24 bg-gray-50">
      <div ref={sectionRef} className="container mx-auto px-8">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Header */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-wide">
              Pianifica la tua<br />
              <span className="italic">fuga perfetta</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Scopri le nostre offerte e personalizza il tuo soggiorno 
              per vivere un'esperienza indimenticabile.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Preventivo Card */}
            <div className={`group transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white p-8 md:p-10 rounded-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
                <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">
                  Preventivo Personalizzato
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Ricevi un preventivo su misura per le tue esigenze 
                  e scopri le migliori offerte disponibili.
                </p>
                <Button
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-none py-3 transition-all duration-300"
                  asChild
                >
                  <Link to="/richiedi-preventivo" className="font-light tracking-wide">
                    Calcola Preventivo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Appartamenti Card */}
            <div className={`group transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white p-8 md:p-10 rounded-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full">
                <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">
                  Esplora gli Appartamenti
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Scopri i nostri appartamenti e scegli quello 
                  che meglio si adatta al tuo stile di vacanza.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 hover:bg-gray-50 rounded-none py-3 transition-all duration-300"
                  asChild
                >
                  <Link to="/appartamenti" className="font-light tracking-wide">
                    Vedi Appartamenti
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

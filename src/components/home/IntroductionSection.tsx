
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
    <section className="py-32 bg-white">
      <div ref={sectionRef} className="container mx-auto px-8">
        
        {/* Section header */}
        <div className={`max-w-3xl mx-auto text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            Una villa<br />
            <span className="italic">unica</span>
          </h2>
          <div className="w-16 h-px bg-gray-300 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            Nel cuore del Salento, dove il tempo sembra rallentare e la bellezza 
            naturale incontra il comfort raffinato.
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          
          {/* Left: Image placeholder */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden">
              <img 
                src="/images/hero/hero.jpg" 
                alt="Villa MareBlu"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gray-50 rounded-sm -z-10"></div>
          </div>

          {/* Right: Content */}
          <div className={`space-y-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                Posizione privilegiata
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                A soli 100 metri dalla costa ionica, Villa MareBlu gode di una 
                posizione unica che permette di raggiungere il mare in pochi passi, 
                immersi nella quiete del paesaggio salentino.
              </p>
              <div className="w-12 h-px bg-gray-300"></div>
            </div>

            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                Comfort e tranquillità
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Ogni appartamento è stato progettato per offrire il massimo comfort, 
                con terrazze panoramiche che si affacciano sul mare e spazi interni 
                curati nei minimi dettagli.
              </p>
              <div className="w-12 h-px bg-gray-300"></div>
            </div>

            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                L'esperienza autentica
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vivere Villa MareBlu significa immergersi nella cultura salentina, 
                tra tramonti mozzafiato, sapori genuini e l'ospitalità calorosa 
                del Sud Italia.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

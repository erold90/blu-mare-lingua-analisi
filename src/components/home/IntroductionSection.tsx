
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
      className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30 py-32 md:py-40 overflow-hidden"
    >
      {/* Modern decorative background */}
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-cyan-50/20"></div>
      </div>
      
      <div className="container px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-8">
              <span className="text-blue-700 font-medium text-sm uppercase tracking-wide">La Nostra Storia</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
              Benvenuti a
              <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">
                Villa MareBlu
              </span>
            </h2>
          </div>
          
          {/* Content grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Text */}
            <div className={`space-y-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Nel cuore del Salento
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Situata nel <span className="font-semibold text-blue-600">pittoresco Sud del Salento</span>, 
                  la nostra villa offre il rifugio ideale per una fuga tranquilla dal caos quotidiano.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ogni dettaglio è stato curato per garantire il <span className="font-semibold text-cyan-600">massimo comfort</span> 
                  e creare un'atmosfera di assoluta tranquillità.
                </p>
              </div>
              
              <div className="h-px w-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Vista mozzafiato sul mare
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  I nostri <span className="font-semibold text-blue-600">terrazzi spaziosi</span> regalano panorami 
                  mozzafiato sul <span className="font-semibold text-cyan-600">Mar Ionio</span>, dove potrai goderti 
                  la brezza marina e ammirare le infinite sfumature di blu.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  <span className="font-semibold text-blue-600">Albe e tramonti</span> diventano spettacoli naturali 
                  da ammirare comodamente dal vostro rifugio privato.
                </p>
              </div>
            </div>
            
            {/* Right column - Features cards */}
            <div className={`grid gap-6 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="text-4xl mb-4">🏖️</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">100m dalla spiaggia</h4>
                <p className="text-gray-600">A pochi passi dal mare cristallino del Salento</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="text-4xl mb-4">🌅</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Vista panoramica</h4>
                <p className="text-gray-600">Terrazzi con vista mozzafiato sul Mar Ionio</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="text-4xl mb-4">💎</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Comfort premium</h4>
                <p className="text-gray-600">Ogni dettaglio curato per il massimo relax</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

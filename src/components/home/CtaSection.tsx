
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
    console.log("🔍 CtaSection rendered with link to /preventivo");
    
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
      className="relative py-24 md:py-32 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-6 relative z-10">
        <Card className={`max-w-4xl mx-auto overflow-hidden bg-gradient-to-r from-white via-blue-50/50 to-white border-0 shadow-2xl transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5" />
          
          <CardContent className="relative p-10 md:p-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className={`flex-1 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Esperienza Esclusiva</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-primary leading-tight">
                  Pronto per prenotare la tua 
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    vacanza da sogno?
                  </span>
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Contattaci oggi per scoprire disponibilità e offerte speciali. 
                  Il tuo rifugio nel Salento ti sta aspettando.
                </p>
              </div>
              
              <div className={`flex-shrink-0 transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}>
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                  asChild
                >
                  <Link to="/preventivo" className="flex items-center gap-3">
                    <span>Calcola Preventivo</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

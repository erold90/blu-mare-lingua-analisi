import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Waves, Home, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { imageService, ImageRecord } from "@/services/imageService";

const IntroductionSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [introImage, setIntroImage] = useState<ImageRecord | null>(null);

  useEffect(() => {
    const loadIntroImage = async () => {
      try {
        const introImages = await imageService.getImagesByCategory('introduction');
        const primaryImage = introImages.find(img => img.is_cover) || introImages[0] || null;
        setIntroImage(primaryImage);
      } catch (error) {
      }
    };

    loadIntroImage();

    // Listen for home image updates from admin panel
    const handleHomeImageUpdate = () => {
      loadIntroImage();
    };

    window.addEventListener('homeImagesUpdated', handleHomeImageUpdate);
    
    return () => {
      window.removeEventListener('homeImagesUpdated', handleHomeImageUpdate);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('introduction-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const handleApartmentsClick = () => {
    navigate("/appartamenti");
  };

  return (
    <section id="introduction-section" className="py-32 bg-white">
      <div className="container mx-auto px-8">
        
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
                src={introImage ? imageService.getGalleryUrl(introImage.file_path) : "/images/apartments/appartamento-1/image1.jpg"}
                alt="Villa MareBlu - Introduzione"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                style={{ contentVisibility: 'auto' }}
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
              <p className="text-gray-600 leading-relaxed mb-6">
                Vivere Villa MareBlu significa immergersi nella cultura salentina, 
                tra tramonti mozzafiato, sapori genuini e l'ospitalità calorosa 
                del Sud Italia.
              </p>
              <div className="w-12 h-px bg-gray-300"></div>
            </div>

            {/* Call to action */}
            <div className="pt-8">
              <Button 
                onClick={handleApartmentsClick}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-none font-light"
              >
                Scopri i nostri appartamenti
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
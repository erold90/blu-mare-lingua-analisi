import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { imageService, ImageRecord } from "@/services/imageService";
import { Skeleton } from "@/components/animations";

const IntroductionSection = () => {
  const navigate = useNavigate();
  const [introImage, setIntroImage] = useState<ImageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIntroImage = async () => {
      try {
        const introImages = await imageService.getImagesByCategory('introduction');
        const primaryImage = introImages.find(img => img.is_cover) || introImages[0] || null;
        setIntroImage(primaryImage);
      } catch (error) {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    loadIntroImage();

    const handleHomeImageUpdate = () => {
      loadIntroImage();
    };

    window.addEventListener('homeImagesUpdated', handleHomeImageUpdate);

    return () => {
      window.removeEventListener('homeImagesUpdated', handleHomeImageUpdate);
    };
  }, []);

  const handleApartmentsClick = () => {
    navigate("/appartamenti");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section id="introduction-section" className="py-32 bg-white overflow-hidden max-w-full">
      <div className="container mx-auto px-4 md:px-8 max-w-full">

        {/* Section header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-wide"
            variants={itemVariants}
          >
            Una villa<br />
            <span className="italic">unica</span>
          </motion.h2>
          <motion.div
            className="w-16 h-px bg-gray-300 mx-auto mb-8"
            variants={itemVariants}
          />
          <motion.p
            className="text-lg text-gray-600 font-light leading-relaxed"
            variants={itemVariants}
          >
            Nel cuore del Salento, dove il tempo sembra rallentare e la bellezza
            naturale incontra il comfort raffinato.
          </motion.p>
        </motion.div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">

          {/* Left: Image */}
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={imageVariants}
          >
            <motion.div
              className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full" rounded="sm" />
              ) : (
                <img
                  src={introImage ? imageService.getGalleryUrl(introImage.file_path) : ""}
                  alt="Villa MareBlu - Introduzione"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-gray-50 rounded-sm -z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={contentVariants}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Posizione privilegiata",
                  text: "A soli 150 metri dalla costa ionica, Villa MareBlu gode di una posizione unica che permette di raggiungere il mare in pochi passi, immersi nella quiete del paesaggio salentino."
                },
                {
                  title: "Comfort e tranquillità",
                  text: "Ogni appartamento è stato progettato per offrire il massimo comfort, con terrazze panoramiche che si affacciano sul mare e spazi interni curati nei minimi dettagli."
                },
                {
                  title: "L'esperienza autentica",
                  text: "Vivere Villa MareBlu significa immergersi nella cultura salentina, tra tramonti mozzafiato, sapori genuini e l'ospitalità calorosa del Sud Italia."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="mb-12"
                  variants={itemVariants}
                >
                  <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {item.text}
                  </p>
                  <div className="w-12 h-px bg-gray-300"></div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to action */}
            <motion.div
              className="pt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleApartmentsClick}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-none font-light transition-all duration-300"
                >
                  Scopri i nostri appartamenti
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;

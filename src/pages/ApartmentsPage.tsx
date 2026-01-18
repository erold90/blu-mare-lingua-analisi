
import React, { useState, useEffect } from "react";
import { apartments } from "@/data/apartments";
import SEOHead from "@/components/seo/SEOHead";
import { getVacationRentalSchema, getBreadcrumbSchema, getFAQSchemaForPage } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";
import { useApartmentImages } from "@/hooks/apartments/useApartmentImages";
import { ApartmentPageHeader } from "@/components/apartments/ApartmentPageHeader";
import { ApartmentGrid } from "@/components/apartments/ApartmentGrid";
import { WhyChooseSection } from "@/components/apartments/WhyChooseSection";
import FAQSection from "@/components/faq/FAQSection";
import { apartmentsFAQs } from "@/data/faqData";

const ApartmentsPage = () => {
  const { apartmentImages, reloadImages } = useApartmentImages();

  // Listen for image updates from admin panel
  useEffect(() => {
    const handleImageUpdate = () => {
      reloadImages();
    };

    window.addEventListener('apartmentImagesUpdated', handleImageUpdate);
    
    return () => {
      window.removeEventListener('apartmentImagesUpdated', handleImageUpdate);
    };
  }, [reloadImages]);

  // Prepare data for structured data
  const apartmentsWithImages = apartments.map(apt => ({
    ...apt,
    images: apartmentImages[apt.id] || ["/placeholder.svg"]
  }));

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Appartamenti", url: "/appartamenti" }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbItems),
    ...apartmentsWithImages.map(apt => getVacationRentalSchema(apt)),
    getFAQSchemaForPage('apartments')
  ];

  const handleApartmentDetailsClick = (apartmentId: string) => {
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Appartamenti 4-8 Persone Torre Vado | Casa Vacanze Parcheggio Privato Salento | Vicino Pescoluse"
        description="4 appartamenti vacanze Torre Vado: 4, 5, 6 e 8 posti letto con vista mare. Aria condizionata, parcheggio privato, WiFi gratuito, terrazza, animali ammessi. A 5 minuti da Pescoluse. Prenota diretto senza commissioni!"
        keywords={getPageSpecificKeywords('apartments')}
        canonicalUrl="/appartamenti"
        structuredData={structuredData}
        ogTitle="Appartamenti Vacanze Torre Vado Salento | Vista Mare"
        ogDescription="4 appartamenti da 4 a 8 posti con vista mare a Torre Vado. Vicino Pescoluse e Leuca. Terrazza, Wi-Fi, parcheggio incluso!"
      />

      <ApartmentPageHeader />

      <ApartmentGrid
        apartmentImages={apartmentImages}
        onApartmentDetailsClick={handleApartmentDetailsClick}
      />

      <WhyChooseSection />

      <FAQSection
        faqs={apartmentsFAQs}
        title="Domande sugli Appartamenti"
        subtitle="Informazioni dettagliate sui nostri alloggi a Torre Vado"
      />
    </div>
  );
};

export default ApartmentsPage;

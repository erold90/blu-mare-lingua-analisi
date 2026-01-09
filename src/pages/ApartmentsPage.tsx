
import React, { useState, useEffect } from "react";
import { apartments } from "@/data/apartments";
import SEOHead from "@/components/seo/SEOHead";
import { getVacationRentalSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";
import { useApartmentImages } from "@/hooks/apartments/useApartmentImages";
import { ApartmentPageHeader } from "@/components/apartments/ApartmentPageHeader";
import { ApartmentGrid } from "@/components/apartments/ApartmentGrid";
import { WhyChooseSection } from "@/components/apartments/WhyChooseSection";

const ApartmentsPage = () => {
  const { apartmentImages, isLoading, reloadImages } = useApartmentImages();

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
    ...apartmentsWithImages.map(apt => getVacationRentalSchema(apt))
  ];

  const handleApartmentDetailsClick = (apartmentId: string) => {
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <div className="text-center">
          <div className="text-xl">Caricamento appartamenti...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Appartamenti Vacanze Torre Vado Salento | Casa Vacanze Pescoluse Leuca | 4-8 Posti Vista Mare"
        description="4 appartamenti vacanze a Torre Vado, Salento: da 4 a 8 posti letto con vista mare. Vicino Pescoluse (Maldive del Salento) e Leuca. Terrazza panoramica, Wi-Fi, parcheggio. Prenota diretto!"
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
    </div>
  );
};

export default ApartmentsPage;

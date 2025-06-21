
import React, { useState } from "react";
import { apartments } from "@/data/apartments";
import SEOHead from "@/components/seo/SEOHead";
import { getApartmentSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";
import { ApartmentDialog } from "@/components/quote/ApartmentDialog";
import { useApartmentImages } from "@/hooks/apartments/useApartmentImages";
import { ApartmentPageHeader } from "@/components/apartments/ApartmentPageHeader";
import { ApartmentGrid } from "@/components/apartments/ApartmentGrid";
import { WhyChooseSection } from "@/components/apartments/WhyChooseSection";

const ApartmentsPage = () => {
  const { apartmentImages, isLoading } = useApartmentImages();
  const [selectedApartmentForModal, setSelectedApartmentForModal] = useState<string | null>(null);

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
    ...apartmentsWithImages.map(apt => getApartmentSchema(apt))
  ];

  const handleApartmentDetailsClick = (apartmentId: string) => {
    setSelectedApartmentForModal(apartmentId);
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
        title="Appartamenti Vacanze Vista Mare Salento - Villa MareBlu Puglia | Casa Vacanze Sul Mare"
        description="Scopri i nostri appartamenti vacanze con vista mare in Salento: villa fronte mare, giardino, 4-8 persone. Appartamenti ammobiliati Puglia, Santa Maria di Leuca. Prenota ora!"
        keywords={getPageSpecificKeywords('apartments')}
        canonicalUrl="/appartamenti"
        structuredData={structuredData}
        ogTitle="Appartamenti Vacanze Vista Mare Salento - Villa MareBlu"
        ogDescription="Appartamenti vacanze con vista mare in Salento. La tua casa vacanze fronte mare ideale in Puglia!"
      />

      <ApartmentPageHeader />

      <ApartmentGrid
        apartmentImages={apartmentImages}
        onApartmentDetailsClick={handleApartmentDetailsClick}
      />

      {/* Apartment Modal - Rendered conditionally outside the cards */}
      {selectedApartmentForModal && (
        <ApartmentDialog
          apartment={apartments.find(apt => apt.id === selectedApartmentForModal)!}
          isSelected={false}
          onToggle={() => {}}
          onClose={() => setSelectedApartmentForModal(null)}
        />
      )}

      <WhyChooseSection />
    </div>
  );
};

export default ApartmentsPage;

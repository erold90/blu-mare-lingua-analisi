import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useMultiStepQuote } from '@/hooks/useMultiStepQuote';
import { StepGuests } from '@/components/quote/StepGuests';
import { StepDates } from '@/components/quote/StepDates';
import StepApartments from '@/components/quote/StepApartments';
import StepServices from '@/components/quote/StepServices';
import { StepSummary } from '@/components/quote/StepSummary';
import SEOHead from '@/components/seo/SEOHead';
import { getFAQSchemaForPage } from '@/components/seo/StructuredData';
import FAQSection from '@/components/faq/FAQSection';
import { quoteFAQs } from '@/data/faqData';

export default function RequestQuotePage() {
  const {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    getBedsNeeded,
    getNights,
    isApartmentAvailable,
    isValidDay,
    calculatePrice,
    getDateBlockInfo,
    requiresTwoWeeksMinimum,
    prenotazioni
  } = useMultiStepQuote();

  // Scroll to top quando cambia step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const steps = [
    'Ospiti',
    'Date',
    'Appartamenti',
    'Servizi Extra',
    'Riepilogo'
  ];

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <StepGuests
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            getBedsNeeded={getBedsNeeded}
          />
        );
      case 2:
        return (
          <StepDates
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            getNights={getNights}
            isValidDay={isValidDay}
            getDateBlockInfo={getDateBlockInfo}
            requiresTwoWeeksMinimum={requiresTwoWeeksMinimum}
          />
        );
      case 3:
        return (
          <StepApartments
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            getBedsNeeded={getBedsNeeded}
            isApartmentAvailable={isApartmentAvailable}
            prenotazioni={prenotazioni}
          />
        );
      case 4:
        return (
          <StepServices
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            getBedsNeeded={getBedsNeeded}
          />
        );
      case 5:
        return (
          <StepSummary
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            getNights={getNights}
            getBedsNeeded={getBedsNeeded}
            calculatePrice={calculatePrice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Preventivo Vacanze Torre Vado Senza Commissioni | Prenota Diretto Salento | Villa MareBlu"
        description="Calcola il preventivo e prenota diretto senza commissioni! Casa vacanze Torre Vado, appartamenti 4-8 posti, vicino Pescoluse e Leuca. Prezzi migliori di Airbnb, risparmia fino al 15%!"
        canonicalUrl="/preventivo"
        ogTitle="Calcola Preventivo Vacanza Salento | Villa MareBlu Torre Vado"
        ogDescription="Preventivo istantaneo per appartamenti vacanza a Torre Vado. Vista mare, vicino Pescoluse. Prezzi chiari!"
        structuredData={[getFAQSchemaForPage('quote')]}
      />

      {/* Sticky Progress Bar - Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2">
              <span className="font-medium">
                <span className="hidden sm:inline">Step </span>{currentStep}/{steps.length}: {steps[currentStep - 1]}
              </span>
              <span className="tabular-nums">{Math.round((currentStep / steps.length) * 100)}%</span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-1.5 sm:h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header - Solo primo step */}
          {currentStep === 1 && (
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-primary tracking-wide">
                Villa MareBlu
              </h1>
              <div className="mt-3 mb-4 sm:mb-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary/50"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div>
                <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary/50"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
                Richiedi il tuo preventivo
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sistema intelligente di preventivazione
              </p>
            </div>
          )}

          {renderStepContent()}

          {/* FAQ Section - Mostrata solo nel primo step per non interferire con il form */}
          {currentStep === 1 && (
            <FAQSection
              faqs={quoteFAQs}
              title="Domande su Prenotazioni e Prezzi"
              subtitle="Informazioni utili per la tua prenotazione diretta"
              className="mt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
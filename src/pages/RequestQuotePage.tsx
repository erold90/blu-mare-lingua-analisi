import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useMultiStepQuote } from '@/hooks/useMultiStepQuote';
import { StepGuests } from '@/components/quote/StepGuests';
import { StepDates } from '@/components/quote/StepDates';
import StepApartments from '@/components/quote/StepApartments';
import StepServices from '@/components/quote/StepServices';
import { StepSummary } from '@/components/quote/StepSummary';
import SEOHead from '@/components/seo/SEOHead';

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
        title="Preventivo Casa Vacanze Torre Vado | Calcola Prezzo Appartamento Salento | Villa MareBlu"
        description="Calcola il preventivo per la tua vacanza a Torre Vado, Salento. Appartamenti vista mare da 4 a 8 posti. Vicino Pescoluse e Leuca. Prezzi trasparenti, prenota diretto!"
        canonicalUrl="/richiedi-preventivo"
        ogTitle="Calcola Preventivo Vacanza Salento | Villa MareBlu Torre Vado"
        ogDescription="Preventivo istantaneo per appartamenti vacanza a Torre Vado. Vista mare, vicino Pescoluse. Prezzi chiari!"
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
          {/* Header - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              Richiedi il tuo preventivo
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sistema intelligente di preventivazione
            </p>
          </div>

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useMultiStepQuote } from '@/hooks/useMultiStepQuote';
import { StepGuests } from '@/components/quote/StepGuests';
import { StepDates } from '@/components/quote/StepDates';
import StepApartments from '@/components/quote/StepApartments';
import { StepPets } from '@/components/quote/StepPets';
import { StepLinen } from '@/components/quote/StepLinen';
import { StepSummary } from '@/components/quote/StepSummary';
import { StepWhatsApp } from '@/components/quote/StepWhatsApp';
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

  const steps = [
    'Ospiti', 
    'Date', 
    'Appartamenti', 
    'Animali', 
    'Biancheria', 
    'Riepilogo', 
    'Invio'
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
          <StepPets
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <StepLinen
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            getBedsNeeded={getBedsNeeded}
          />
        );
      case 6:
        return (
          <StepSummary
            formData={formData}
            onNext={nextStep}
            onPrev={prevStep}
            getNights={getNights}
            getBedsNeeded={getBedsNeeded}
            calculatePrice={calculatePrice}
          />
        );
      case 7:
        return (
          <StepWhatsApp
            formData={formData}
            updateFormData={updateFormData}
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
    <div className="container mx-auto py-8">
      <SEOHead
        title="Preventivo Casa Vacanze Torre Vado | Calcola Prezzo Appartamento Salento | Villa MareBlu"
        description="Calcola il preventivo per la tua vacanza a Torre Vado, Salento. Appartamenti vista mare da 4 a 8 posti. Vicino Pescoluse e Leuca. Prezzi trasparenti, prenota diretto!"
        canonicalUrl="/richiedi-preventivo"
        ogTitle="Calcola Preventivo Vacanza Salento | Villa MareBlu Torre Vado"
        ogDescription="Preventivo istantaneo per appartamenti vacanza a Torre Vado. Vista mare, vicino Pescoluse. Prezzi chiari!"
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Richiedi il tuo preventivo</h1>
          <p className="text-muted-foreground">
            Sistema intelligente di preventivazione per Villa MareBlu
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} di {steps.length}: {steps[currentStep - 1]}</span>
            <span>{Math.round((currentStep / steps.length) * 100)}% completato</span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
}
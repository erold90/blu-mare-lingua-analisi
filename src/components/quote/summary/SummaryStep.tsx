
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPriceUnified, refreshApartmentPrices } from "@/utils/price/unifiedPriceCalculator";
import { PriceCalculation, emptyPriceCalculation } from "@/utils/price/types";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/activity/useActivityLog";
import { useUnifiedPrices } from "@/hooks/useUnifiedPrices";

// Import refactored components
import SummaryLayout from "./SummaryLayout";
import SummaryContent from "./SummaryContent";
import QuoteActions from "./QuoteActions";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ 
  form, 
  apartments, 
  prevStep,
  sendWhatsApp
}) => {
  const { addQuoteLog } = useActivityLog();
  const { prices, getPriceForWeek, refreshPrices } = useUnifiedPrices();
  
  const [priceInfo, setPriceInfo] = useState<PriceCalculation>(emptyPriceCalculation);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  
  // Ref per tracciare se il calcolo è in corso
  const calculationInProgress = useRef(false);
  
  // Memoizza i valori del form in modo stabile
  const formValues = useMemo(() => {
    const values = form.getValues();
    return {
      ...values,
      // Assicurati che le date siano oggetti Date validi
      checkIn: values.checkIn ? new Date(values.checkIn) : null,
      checkOut: values.checkOut ? new Date(values.checkOut) : null,
    };
  }, [
    form.watch('selectedApartments'),
    form.watch('selectedApartment'),
    form.watch('checkIn'),
    form.watch('checkOut'),
    form.watch('adults'),
    form.watch('children'),
    form.watch('needsLinen'),
    form.watch('hasPets'),
    form.watch('petsCount')
  ]);
  
  // Memoizza gli ID degli appartamenti selezionati
  const selectedApartmentIds = useMemo(() => {
    return formValues.selectedApartments || 
      (formValues.selectedApartment ? [formValues.selectedApartment] : []);
  }, [formValues.selectedApartments, formValues.selectedApartment]);
  
  // Memoizza gli appartamenti selezionati
  const selectedApartments = useMemo(() => {
    return apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  }, [apartments, selectedApartmentIds]);
  
  // Funzione per calcolare i prezzi con gestione errori migliorata
  const calculatePrices = useCallback(async () => {
    // Previeni calcoli multipli simultanei
    if (calculationInProgress.current) {
      console.log("⏳ Price calculation already in progress, skipping...");
      return;
    }
    
    if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
      console.log("❌ Missing required data for price calculation");
      setPriceInfo(emptyPriceCalculation);
      setIsLoadingPrices(false);
      setCalculationError("Dati mancanti per il calcolo del prezzo");
      return;
    }
    
    // Validazione aggiuntiva delle date
    if (formValues.checkIn >= formValues.checkOut) {
      console.log("❌ Invalid date range");
      setPriceInfo(emptyPriceCalculation);
      setIsLoadingPrices(false);
      setCalculationError("Date non valide");
      return;
    }
    
    calculationInProgress.current = true;
    setIsLoadingPrices(true);
    setCalculationError(null);
    
    try {
      console.log("🔍 Starting price calculation with unified prices...");
      console.log("📋 Available prices count:", prices.length);
      console.log("📋 Form values:", {
        apartments: selectedApartmentIds,
        checkIn: formValues.checkIn,
        checkOut: formValues.checkOut,
        adults: formValues.adults,
        children: formValues.children
      });
      
      // Prima verifica se abbiamo prezzi per le date richieste
      const testPrice = getPriceForWeek(selectedApartmentIds[0], formValues.checkIn);
      console.log("🧪 Test price for first week:", testPrice);
      
      if (testPrice === 0 && prices.length === 0) {
        console.log("⚠️ No prices available, refreshing...");
        await refreshPrices();
      }
      
      const calculatedPrices = await calculateTotalPriceUnified(formValues, apartments, getPriceForWeek);
      
      // Verifica se il calcolo ha prodotto risultati validi
      if (calculatedPrices.totalPrice === 0 && calculatedPrices.basePrice === 0) {
        console.warn("⚠️ Price calculation returned zero prices");
        setCalculationError("Prezzi non disponibili per le date selezionate");
        
        // Prova a ricaricare i prezzi per gli appartamenti selezionati
        const currentYear = formValues.checkIn?.getFullYear() || new Date().getFullYear();
        for (const apartmentId of selectedApartmentIds) {
          await refreshApartmentPrices(apartmentId, currentYear);
        }
        
        // Riprova il calcolo
        const recalculatedPrices = await calculateTotalPriceUnified(formValues, apartments, getPriceForWeek);
        setPriceInfo(recalculatedPrices);
        
        if (recalculatedPrices.totalPrice > 0) {
          setCalculationError(null);
        }
      } else {
        console.log("✅ Price calculation completed:", calculatedPrices);
        setPriceInfo(calculatedPrices);
      }
      
    } catch (error) {
      console.error("❌ Error calculating prices:", error);
      setPriceInfo(emptyPriceCalculation);
      setCalculationError("Errore nel calcolo del prezzo. Riprova.");
    } finally {
      setIsLoadingPrices(false);
      calculationInProgress.current = false;
    }
  }, [formValues, apartments, selectedApartments, selectedApartmentIds, prices, getPriceForWeek, refreshPrices]);
  
  // Effect per calcolare i prezzi quando cambiano i dati rilevanti
  useEffect(() => {
    console.log("🔄 Price calculation effect triggered");
    calculatePrices();
  }, [calculatePrices]);
  
  // Effect per sincronizzare selectedApartment quando c'è solo un appartamento
  useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      console.log("🔄 Syncing selectedApartment:", selectedApartmentIds[0]);
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);
  
  // Effect per il log del preventivo (solo una volta)
  useEffect(() => {
    const quoteLogId = localStorage.getItem('currentQuoteLogId') || uuidv4();
    
    addQuoteLog({
      id: quoteLogId,
      timestamp: new Date().toISOString(),
      form_values: formValues,
      step: 5,
      completed: true
    });
    
    localStorage.setItem('currentQuoteLogId', quoteLogId);
  }, []); // Dipendenze vuote per eseguire solo al mount
  
  // Render delle azioni footer
  const footerActions = useMemo(() => (
    <QuoteActions 
      prevStep={prevStep} 
      sendWhatsApp={sendWhatsApp}
      formValues={formValues}
      apartments={apartments}
      priceInfo={priceInfo}
    />
  ), [prevStep, sendWhatsApp, formValues, apartments, priceInfo]);
  
  // Loading state migliorato
  if (isLoadingPrices) {
    return (
      <SummaryLayout footer={footerActions}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium">Calcolo prezzi in corso...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Recupero dei prezzi dal database...
          </div>
          {calculationError && (
            <div className="text-sm text-orange-600 mt-2 p-2 bg-orange-50 rounded">
              {calculationError}
            </div>
          )}
        </div>
      </SummaryLayout>
    );
  }
  
  // Error state
  if (calculationError && priceInfo.totalPrice === 0) {
    return (
      <SummaryLayout footer={footerActions}>
        <div className="text-center py-8">
          <div className="text-lg font-medium text-red-600 mb-4">
            Errore nel calcolo del preventivo
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {calculationError}
          </div>
          <button 
            onClick={calculatePrices}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Riprova calcolo
          </button>
        </div>
      </SummaryLayout>
    );
  }
  
  return (
    <SummaryLayout footer={footerActions}>
      <SummaryContent
        formValues={formValues}
        priceInfo={priceInfo}
        selectedApartments={selectedApartments}
        apartments={apartments}
        form={form}
      />
      {calculationError && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="text-sm text-yellow-800">
            ⚠️ {calculationError} - I prezzi mostrati potrebbero non essere aggiornati.
          </div>
        </div>
      )}
    </SummaryLayout>
  );
};

export default SummaryStep;

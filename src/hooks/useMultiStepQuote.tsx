import { useState, useCallback, useEffect } from 'react';
import { useDynamicQuote } from './useDynamicQuote';
import { pricingService } from '@/services/supabase/pricingService';

export interface QuoteFormData {
  // Step 1: Ospiti
  adults: number;
  children: number;
  childrenWithParents: boolean[];
  
  // Step 2: Date
  checkIn: string;
  checkOut: string;
  
  // Step 3: Appartamenti
  selectedApartments: string[];
  
  // Step 4: Animali
  hasPets: boolean;
  petCount?: number;
  
  // Step 5: Biancheria
  requestLinen: boolean;
  
  // Contatto (Step 6)
  guestName: string;
  email: string;
  phone: string;
}

// FALLBACK: Prenotazioni statiche usate solo per UI quando il database non è disponibile
// Le verifiche di disponibilità reali usano il database tramite PricingService.checkAvailability()
const prenotazioniStatiche = [
  // Appartamento 1
  { apt: "1", checkin: '2025-07-12', checkout: '2025-07-26', ospite: 'Stanila Livia' },
  { apt: "1", checkin: '2025-08-02', checkout: '2025-08-23', ospite: 'Angela Monda' },
  
  // Appartamento 2  
  { apt: "2", checkin: '2025-06-21', checkout: '2025-06-28', ospite: 'Davidescu Magdalena' },
  { apt: "2", checkin: '2025-08-16', checkout: '2025-08-23', ospite: 'Ida Manasterliu' },
  
  // Appartamento 3
  { apt: "3", checkin: '2025-07-26', checkout: '2025-08-09', ospite: 'Dechambre Manon' },
  { apt: "3", checkin: '2025-08-16', checkout: '2025-08-23', ospite: 'Elisa Valdo' },
  
  // Appartamento 4
  { apt: "4", checkin: '2025-07-12', checkout: '2025-07-19', ospite: 'Metta Laura' },
  { apt: "4", checkin: '2025-08-02', checkout: '2025-08-09', ospite: 'Nestri Valeria' },
  { apt: "4", checkin: '2025-08-09', checkout: '2025-08-23', ospite: 'Salvatore Somma' }
];

export const useMultiStepQuote = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dateBlocks, setDateBlocks] = useState<any[]>([]);
  const [formData, setFormData] = useState<QuoteFormData>({
    adults: 1,
    children: 0,
    childrenWithParents: [],
    checkIn: '',
    checkOut: '',
    selectedApartments: [],
    hasPets: false,
    requestLinen: false,
    guestName: '',
    email: '',
    phone: ''
  });

  // Load date blocks on mount
  useEffect(() => {
    const loadDateBlocks = async () => {
      try {
        const blocks = await pricingService.getDateBlocks();
        setDateBlocks(blocks);
      } catch (error) {
        // Silently handle error loading date blocks
      }
    };
    
    loadDateBlocks();
  }, []);

  // Hook per gestione dinamica prezzi
  const { 
    calculateQuote, 
    checkAvailability, 
    checkMultipleAvailability,
    quoteResult,
    loading: priceLoading,
    saveQuote
  } = useDynamicQuote();

  const updateFormData = useCallback((updates: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 7));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      adults: 1,
      children: 0,
      childrenWithParents: [],
      checkIn: '',
      checkOut: '',
      selectedApartments: [],
      hasPets: false,
      requestLinen: false,
      guestName: '',
      email: '',
      phone: ''
    });
  }, []);

  // Utility functions
  const getBedsNeeded = useCallback(() => {
    const childrenInBeds = formData.childrenWithParents.filter(withParents => !withParents).length;
    return formData.adults + childrenInBeds;
  }, [formData.adults, formData.childrenWithParents]);

  const getNights = useCallback(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [formData.checkIn, formData.checkOut]);

  const isApartmentAvailable = useCallback(async (apartmentId: string, checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return true;
    
    try {
      // Converte ID appartamento da stringa a numero
      const numericId = parseInt(apartmentId);
      return await checkAvailability(numericId, checkIn, checkOut);
    } catch (error) {
      return false;
    }
  }, [checkAvailability]);

  const isValidDay = useCallback((date: Date) => {
    const day = date.getDay(); // 0 = domenica, 6 = sabato, 1 = lunedì
    return day === 0 || day === 1 || day === 6; // sabato, domenica, lunedì
  }, []);

  const calculatePrice = useCallback(async () => {
    if (!formData.selectedApartments.length || !formData.checkIn || !formData.checkOut) {
      return { 
        apartmentPrices: [], 
        servicesTotal: 0, 
        subtotal: 0, 
        finalDiscount: 0, 
        total: 0,
        deposit: 0,
        balance: 0
      };
    }

    try {
      const params = {
        apartments: formData.selectedApartments.map(id => parseInt(id)),
        checkin: formData.checkIn,
        checkout: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        childrenNoBed: formData.childrenWithParents.filter(Boolean).length,
        hasPet: formData.hasPets,
        petApartment: undefined,
        petCount: formData.petCount || 1,
        needsLinen: formData.requestLinen
      };

      const result = await calculateQuote(params);
      
      if (result) {
        return {
          apartmentPrices: result.apartmentDetails.map(detail => ({
            apartmentId: detail.apartmentId.toString(),
            name: detail.apartment.name,
            capacity: detail.apartment.beds,
            basePrice: detail.basePrice,
            occupation: `${detail.occupiedBeds}/${detail.apartment.beds}`,
            occupationPercent: Math.round((detail.occupiedBeds / detail.apartment.beds) * 100),
            discount: detail.discountPercent,
            discountAmount: detail.discountAmount,
            finalPrice: detail.finalPrice
          })),
          servicesTotal: result.extrasTotal,
          subtotal: result.baseTotal + result.extrasTotal,
          finalDiscount: result.discountTotal,
          total: result.finalTotal,
          deposit: result.deposit,
          balance: result.balance
        };
      }
    } catch (error) {
      // Handle error silently
    }

    return { 
      apartmentPrices: [], 
      servicesTotal: 0, 
      subtotal: 0, 
      finalDiscount: 0, 
      total: 0,
      deposit: 0,
      balance: 0
    };
  }, [formData, calculateQuote]);

  const saveQuoteToDatabase = useCallback(async () => {
    if (!quoteResult) return null;

    const params = {
      apartments: formData.selectedApartments.map(id => parseInt(id)),
      checkin: formData.checkIn,
      checkout: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
      childrenNoBed: formData.childrenWithParents.filter(Boolean).length,
      hasPet: formData.hasPets,
      petApartment: undefined,
      petCount: formData.petCount || 1,
      needsLinen: formData.requestLinen,
      guestName: formData.guestName,
      guestEmail: formData.email,
      guestPhone: formData.phone
    };

    return await saveQuote(params);
  }, [formData, quoteResult, saveQuote]);

  // Check if a date is blocked and return block reason
  const getDateBlockInfo = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    for (const block of dateBlocks) {
      if (dateStr >= block.start_date && dateStr <= block.end_date) {
        return {
          isBlocked: true,
          reason: block.block_reason || 'Periodo non disponibile'
        };
      }
    }
    
    return { isBlocked: false, reason: '' };
  }, [dateBlocks]);

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    resetForm,
    getBedsNeeded,
    getNights,
    isApartmentAvailable,
    isValidDay,
    calculatePrice,
    saveQuoteToDatabase,
    getDateBlockInfo,
    priceLoading,
    prenotazioni: prenotazioniStatiche
  };
};
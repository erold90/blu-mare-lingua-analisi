import { useState, useCallback } from 'react';

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
  petApartment?: string;
  
  // Step 5: Biancheria
  requestLinen: boolean;
  
  // Contatto (Step 6)
  guestName: string;
  email: string;
  phone: string;
}

const prenotazioni = [
  // Appartamento 1
  { apt: "appartamento-1", checkin: '2025-07-12', checkout: '2025-07-26', ospite: 'Stanila Livia' },
  { apt: "appartamento-1", checkin: '2025-08-02', checkout: '2025-08-23', ospite: 'Angela Monda' },
  
  // Appartamento 2  
  { apt: "appartamento-2", checkin: '2025-06-21', checkout: '2025-06-28', ospite: 'Davidescu Magdalena' },
  { apt: "appartamento-2", checkin: '2025-08-16', checkout: '2025-08-23', ospite: 'Ida Manasterliu' },
  
  // Appartamento 3
  { apt: "appartamento-3", checkin: '2025-07-26', checkout: '2025-08-09', ospite: 'Dechambre Manon' },
  { apt: "appartamento-3", checkin: '2025-08-16', checkout: '2025-08-23', ospite: 'Elisa Valdo' },
  
  // Appartamento 4
  { apt: "appartamento-4", checkin: '2025-07-12', checkout: '2025-07-19', ospite: 'Metta Laura' },
  { apt: "appartamento-4", checkin: '2025-08-02', checkout: '2025-08-09', ospite: 'Nestri Valeria' },
  { apt: "appartamento-4", checkin: '2025-08-09', checkout: '2025-08-23', ospite: 'Salvatore Somma' }
];

const prezziSettimanali = {
  "appartamento-1": {
    "2025-06-07_2025-06-27": 400,
    "2025-06-28_2025-07-04": 400,
    "2025-07-05_2025-07-11": 475,
    "2025-07-26_2025-08-01": 750,
    "2025-08-23_2025-09-05": 750,
    "2025-09-06_2025-10-03": 500
  },
  "appartamento-2": {
    "2025-06-07_2025-06-20": 500,
    "2025-06-28_2025-07-04": 500,
    "2025-07-05_2025-07-25": 575,
    "2025-07-26_2025-08-08": 850,
    "2025-08-09_2025-08-15": 1250,
    "2025-08-23_2025-09-05": 850,
    "2025-09-06_2025-10-03": 600
  },
  "appartamento-3": {
    "2025-06-07_2025-06-27": 350,
    "2025-06-28_2025-07-04": 350,
    "2025-07-05_2025-07-25": 425,
    "2025-08-09_2025-08-15": 1075,
    "2025-08-23_2025-09-05": 675,
    "2025-09-06_2025-10-03": 425
  },
  "appartamento-4": {
    "2025-06-07_2025-06-27": 375,
    "2025-06-28_2025-07-04": 375,
    "2025-07-05_2025-07-11": 450,
    "2025-07-19_2025-07-25": 450,
    "2025-07-26_2025-08-01": 700,
    "2025-08-23_2025-09-05": 700,
    "2025-09-06_2025-10-03": 450
  }
};

export const useMultiStepQuote = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const isApartmentAvailable = useCallback((apartmentId: string, checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return true;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    return !prenotazioni.some(prenotazione => {
      if (prenotazione.apt !== apartmentId) return false;
      
      const prenotazioneStart = new Date(prenotazione.checkin);
      const prenotazioneEnd = new Date(prenotazione.checkout);
      
      // Check for overlap
      return (startDate < prenotazioneEnd && endDate > prenotazioneStart);
    });
  }, []);

  const isValidDay = useCallback((date: Date) => {
    const day = date.getDay(); // 0 = domenica, 6 = sabato, 1 = lunedì
    return day === 0 || day === 1 || day === 6; // sabato, domenica, lunedì
  }, []);

  const calcolaSconto = useCallback((postiOccupati: number, postiTotali: number) => {
    const percentualeOccupazione = postiOccupati / postiTotali;
    
    if (percentualeOccupazione >= 1.0) return 0;      // 100% = prezzo pieno
    if (percentualeOccupazione >= 0.75) return 12;    // 75% = -12%
    if (percentualeOccupazione >= 0.50) return 27;    // 50% = -27%
    return 40;                                        // <50% = -40%
  }, []);

  const calculatePrice = useCallback(() => {
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

    const nights = getNights();
    const bedsNeeded = getBedsNeeded();
    let apartmentPrices: any[] = [];
    let servicesTotal = 0;

    // Calcola prezzi appartamenti
    formData.selectedApartments.forEach(aptId => {
      const apartment = [
        { id: "appartamento-1", capacity: 6, name: "Appartamento 1" },
        { id: "appartamento-2", capacity: 8, name: "Appartamento 2" },
        { id: "appartamento-3", capacity: 4, name: "Appartamento 3" },
        { id: "appartamento-4", capacity: 5, name: "Appartamento 4" }
      ].find(apt => apt.id === aptId);

      if (!apartment) return;

      // Find matching price period
      const prezzi = prezziSettimanali[aptId as keyof typeof prezziSettimanali];
      let basePrice = 0;

      for (const [period, price] of Object.entries(prezzi)) {
        const [startStr, endStr] = period.split('_');
        const periodStart = new Date(startStr);
        const periodEnd = new Date(endStr);
        const checkInDate = new Date(formData.checkIn);
        
        if (checkInDate >= periodStart && checkInDate <= periodEnd) {
          basePrice = price * nights;
          break;
        }
      }

      // Calcola sconto occupazione
      const discount = calcolaSconto(bedsNeeded, apartment.capacity);
      const discountAmount = (basePrice * discount) / 100;
      const finalPrice = basePrice - discountAmount;

      apartmentPrices.push({
        apartmentId: aptId,
        name: apartment.name,
        capacity: apartment.capacity,
        basePrice,
        occupation: `${bedsNeeded}/${apartment.capacity}`,
        occupationPercent: Math.round((bedsNeeded / apartment.capacity) * 100),
        discount,
        discountAmount,
        finalPrice
      });
    });

    // Servizi aggiuntivi
    if (formData.hasPets) {
      servicesTotal += 50;
    }

    if (formData.requestLinen) {
      servicesTotal += 15 * bedsNeeded;
    }

    const subtotal = apartmentPrices.reduce((sum, apt) => sum + apt.finalPrice, 0) + servicesTotal;
    
    // Sconto finale (multiplo di €50)
    const finalDiscount = Math.floor(subtotal / 50) * 2; // €2 per ogni €50
    const total = subtotal - finalDiscount;
    
    const deposit = Math.round(total * 0.3); // 30%
    const balance = total - deposit;

    return {
      apartmentPrices,
      servicesTotal,
      subtotal,
      finalDiscount,
      total,
      deposit,
      balance
    };
  }, [formData, getNights, getBedsNeeded, calcolaSconto]);

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
    prenotazioni
  };
};
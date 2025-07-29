import { supabase } from '@/integrations/supabase/client';

export interface PricingPeriod {
  id: number;
  apartment_id: number;
  start_date: string;
  end_date: string;
  weekly_price: number;
  season_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Apartment {
  id: number;
  name: string;
  beds: number;
  description: string;
  features: string[];
  base_price: number;
  cleaning_fee: number;
}

export interface QuoteResult {
  apartmentDetails: ApartmentQuoteDetail[];
  baseTotal: number;
  discountTotal: number;
  extrasTotal: number;
  finalTotal: number;
  deposit: number;
  balance: number;
}

export interface ApartmentQuoteDetail {
  apartmentId: number;
  apartment: Apartment;
  basePrice: number;
  occupiedBeds: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
}

export interface QuoteParams {
  apartments: number[];
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  childrenNoBed: number;
  hasPet: boolean;
  petApartment?: number;
  needsLinen: boolean;
}

class PricingService {
  
  // Cache per migliorare performance
  private static cache = new Map<string, any>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minuti

  private static async getOrSetCache<T>(
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Recupera dati appartamento
  static async getApartmentDetails(apartmentId: number): Promise<Apartment> {
    const cacheKey = `apartment_${apartmentId}`;
    
    return this.getOrSetCache(cacheKey, async () => {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', apartmentId)
        .single();
      
      if (error) throw new Error(`Appartamento ${apartmentId} non trovato: ${error.message}`);
      return data;
    });
  }

  // Recupera prezzo per periodo specifico usando weekly_prices
  static async getPriceForPeriod(
    apartmentId: number, 
    checkinDate: string, 
    checkoutDate: string
  ): Promise<number> {
    const cacheKey = `price_${apartmentId}_${checkinDate}_${checkoutDate}`;
    
    return this.getOrSetCache(cacheKey, async () => {
      const checkinYear = new Date(checkinDate).getFullYear();
      const checkoutYear = new Date(checkoutDate).getFullYear();
      
      // Recupera i prezzi settimanali per gli anni coinvolti
      const { data: weeklyPrices, error } = await supabase
        .from('weekly_prices')
        .select('*')
        .eq('apartment_id', apartmentId.toString())
        .in('year', [checkinYear, checkoutYear])
        .gte('week_end', checkinDate)
        .lte('week_start', checkoutDate)
        .order('week_start');
      
      if (error) throw new Error(`Errore nel recupero prezzi: ${error.message}`);
      if (!weeklyPrices?.length) {
        throw new Error(`Nessun prezzo trovato per appartamento ${apartmentId} nel periodo ${checkinDate} - ${checkoutDate}`);
      }
      
      return this.calculateWeeklyPrice(weeklyPrices, checkinDate, checkoutDate);
    });
  }

  // Calcolo prezzo basato su prezzi settimanali
  static calculateWeeklyPrice(
    weeklyPrices: any[], 
    checkin: string, 
    checkout: string
  ): number {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const totalNights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalPrice = 0;
    let currentDate = new Date(checkin);
    
    for (let night = 0; night < totalNights; night++) {
      // Trova il prezzo settimanale che copre questa data
      const weekPrice = weeklyPrices.find(price => {
        const weekStart = new Date(price.week_start);
        const weekEnd = new Date(price.week_end);
        return currentDate >= weekStart && currentDate <= weekEnd;
      });
      
      if (weekPrice) {
        // Calcola il prezzo giornaliero dalla tariffa settimanale
        const dailyRate = weekPrice.price / 7;
        totalPrice += dailyRate;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return Math.round(totalPrice);
  }

  // Verifica disponibilità appartamento
  static async checkAvailability(
    apartmentId: number, 
    checkin: string, 
    checkout: string
  ): Promise<boolean> {
    const cacheKey = `availability_${apartmentId}_${checkin}_${checkout}`;
    
    return this.getOrSetCache(cacheKey, async () => {
      console.log(`🔍 Controllo disponibilità appartamento ${apartmentId} dal ${checkin} al ${checkout}`);
      
      // Verifica conflitti con prenotazioni esistenti
      const { data: conflicts, error } = await supabase
        .from('reservations')
        .select('id')
        .contains('apartment_ids', [apartmentId])
        .lt('start_date', checkout)
        .gt('end_date', checkin);
      
      // Verifica anche i blocchi date
      const { data: dateBlocks } = await supabase
        .from('date_blocks')
        .select('id')
        .eq('is_active', true)
        .or(`apartment_id.eq.${apartmentId},apartment_id.is.null`)
        .lte('start_date', checkout)
        .gte('end_date', checkin);
      
      console.log(`📋 Query results per appartamento ${apartmentId}:`, { conflicts, error });
      
      if (error) {
        console.warn(`⚠️ Errore verifica disponibilità: ${error.message}`);
        // In caso di errore, assumiamo che sia disponibile per evitare blocchi
        return true;
      }
      
      const hasConflicts = (conflicts && conflicts.length > 0) || (dateBlocks && dateBlocks.length > 0);
      const isAvailable = !hasConflicts;
      
      console.log(`✅ Appartamento ${apartmentId} ${isAvailable ? 'DISPONIBILE' : 'OCCUPATO'} (${conflicts?.length || 0} prenotazioni, ${dateBlocks?.length || 0} blocchi)`);
      
      return isAvailable;
    });
  }

  // Calcolo sconto per occupazione
  static calculateOccupancyDiscount(occupiedBeds: number, totalBeds: number): number {
    const occupancyRate = occupiedBeds / totalBeds;
    
    if (occupancyRate >= 1.0) return 0;      // 100% = prezzo pieno
    if (occupancyRate >= 0.75) return 12;    // 75% = -12%
    if (occupancyRate >= 0.50) return 27;    // 50% = -27%
    return 40;                               // <50% = -40%
  }

  // Distribuzione intelligente ospiti tra appartamenti
  static distributeGuestsAcrossApartments(
    totalGuests: number, 
    selectedApartments: number[], 
    targetApartmentId?: number
  ): number {
    if (targetApartmentId) {
      // Se richiesto per un appartamento specifico, calcola la sua porzione
      const apartmentCapacities = {
        1: 6, 2: 8, 3: 4, 4: 5
      };
      
      const totalCapacity = selectedApartments.reduce((sum, id) => 
        sum + apartmentCapacities[id as keyof typeof apartmentCapacities], 0
      );
      
      const apartmentCapacity = apartmentCapacities[targetApartmentId as keyof typeof apartmentCapacities];
      const proportion = apartmentCapacity / totalCapacity;
      
      return Math.min(Math.ceil(totalGuests * proportion), apartmentCapacity);
    }
    
    // Distribuzione ottimale per massimizzare sconti
    return Math.ceil(totalGuests / selectedApartments.length);
  }

  // Arrotondamento intelligente a multipli di 50
  static roundToMultipleOf50(price: number): number {
    return Math.floor(price / 50) * 50;
  }

  // Calcolo preventivo totale
  static async calculateQuote(params: QuoteParams): Promise<QuoteResult> {
    try {
      console.log('🔍 Inizio verifica disponibilità per appartamenti:', params.apartments);
      // Verifica disponibilità per tutti gli appartamenti
      const availabilityChecks = await Promise.all(
        params.apartments.map(async (id) => {
          const isAvailable = await this.checkAvailability(id, params.checkin, params.checkout);
          console.log(`🏠 Appartamento ${id}: ${isAvailable ? 'DISPONIBILE' : 'NON DISPONIBILE'}`);
          return isAvailable;
        })
      );
      
      console.log('📊 Risultati disponibilità:', availabilityChecks);
      
      if (availabilityChecks.some(available => !available)) {
        console.error('❌ Alcuni appartamenti non sono disponibili');
        throw new Error('Uno o più appartamenti non sono disponibili nelle date selezionate');
      }
      
      let baseTotal = 0;
      let discountTotal = 0;
      const apartmentDetails: ApartmentQuoteDetail[] = [];
      
      const totalGuestsInBeds = params.adults + params.children - params.childrenNoBed;
      
      // Calcola prezzo per ogni appartamento
      for (const apartmentId of params.apartments) {
        const apartment = await this.getApartmentDetails(apartmentId);
        const basePrice = await this.getPriceForPeriod(apartmentId, params.checkin, params.checkout);
        
        // Calcola occupazione per questo appartamento
        const occupiedBeds = this.distributeGuestsAcrossApartments(
          totalGuestsInBeds,
          params.apartments,
          apartmentId
        );
        
        const discountPercent = this.calculateOccupancyDiscount(occupiedBeds, apartment.beds);
        const discountAmount = (basePrice * discountPercent) / 100;
        const finalPrice = basePrice - discountAmount;
        
        apartmentDetails.push({
          apartmentId,
          apartment,
          basePrice,
          occupiedBeds,
          discountPercent,
          discountAmount,
          finalPrice
        });
        
        baseTotal += basePrice;
        discountTotal += discountAmount;
      }
      
      // Calcola costi extra
      let extrasTotal = 0;
      if (params.hasPet && params.petApartment) {
        extrasTotal += 50;
      }
      if (params.needsLinen) {
        extrasTotal += totalGuestsInBeds * 15;
      }
      
      const subtotal = baseTotal - discountTotal + extrasTotal;
      const finalTotal = this.roundToMultipleOf50(subtotal);
      const finalDiscount = subtotal - finalTotal;
      
      return {
        apartmentDetails,
        baseTotal,
        discountTotal: discountTotal + finalDiscount,
        extrasTotal,
        finalTotal,
        deposit: this.roundToMultipleOf50(Math.round(finalTotal * 0.3)),
        balance: finalTotal - this.roundToMultipleOf50(Math.round(finalTotal * 0.3))
      };
      
    } catch (error) {
      console.error('Errore nel calcolo preventivo:', error);
      throw error;
    }
  }

  // Salva richiesta preventivo
  static async saveQuoteRequest(params: QuoteParams & {
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
  }, quote: QuoteResult): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          checkin_date: params.checkin,
          checkout_date: params.checkout,
          adults: params.adults,
          children: params.children,
          children_no_bed: params.childrenNoBed,
          selected_apartments: params.apartments,
          has_pet: params.hasPet,
          pet_apartment: params.petApartment,
          linen_requested: params.needsLinen,
          base_total: quote.baseTotal,
          discount_total: quote.discountTotal,
          extras_total: quote.extrasTotal,
          final_total: quote.finalTotal,
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          guest_phone: params.guestPhone
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      console.log('Preventivo salvato con ID:', data.id);
      return data.id;
      
    } catch (error) {
      console.error('Errore nel salvataggio preventivo:', error);
      throw error;
    }
  }

  // Invalidate cache quando i prezzi cambiano
  static invalidateCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export { PricingService };
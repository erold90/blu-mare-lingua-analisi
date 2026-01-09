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
  discountType: 'occupancy' | 'courtesy' | 'none';  // Tipo di sconto applicato
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
      
      // Converti l'ID numerico in formato stringa corretto per il database
      const apartmentStringId = `appartamento-${apartmentId}`;
      
      // Recupera i prezzi settimanali per gli anni coinvolti
      const { data: weeklyPrices, error } = await supabase
        .from('weekly_prices')
        .select('*')
        .eq('apartment_id', apartmentStringId)
        .in('year', [checkinYear, checkoutYear])
        .gte('week_end', checkinDate)
        .lte('week_start', checkoutDate)
        .order('week_start');
      
      if (error) throw new Error(`Errore nel recupero prezzi: ${error.message}`);
      if (!weeklyPrices?.length) {
        throw new Error(`Nessun prezzo trovato per appartamento ${apartmentId} (${apartmentStringId}) nel periodo ${checkinDate} - ${checkoutDate}`);
      }
      
      return this.calculateWeeklyPrice(weeklyPrices, checkinDate, checkoutDate);
    });
  }

  // Calcolo prezzo basato su prezzi settimanali con nuove regole proporzionali
  static calculateWeeklyPrice(
    weeklyPrices: any[], 
    checkin: string, 
    checkout: string
  ): number {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const totalNights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // REGOLA 1: Per soggiorni di 5-6 notti, applica sempre il prezzo settimanale completo
    if (totalNights >= 5 && totalNights <= 6) {
      // Trova il periodo dominante (dove cadono più notti)
      const periodCoverage = this.calculatePeriodCoverage(weeklyPrices, checkin, checkout);
      const dominantPeriod = periodCoverage.reduce((max, current) =>
        current.nights > max.nights ? current : max
      );
      return dominantPeriod.price;
    }

    // REGOLA 2: Per soggiorni di 7+ notti, calcola proporzionalmente
    if (totalNights >= 7) {
      const periodCoverage = this.calculatePeriodCoverage(weeklyPrices, checkin, checkout);
      let totalPrice = 0;

      for (const period of periodCoverage) {
        const proportionalPrice = (period.price / 7) * period.nights;
        totalPrice += proportionalPrice;
      }

      return Math.round(totalPrice);
    }

    // Fallback per soggiorni < 5 notti (non dovrebbe succedere con validazione)
    return 0;
  }

  // Calcola la copertura di notti per ogni periodo di prezzo
  static calculatePeriodCoverage(
    weeklyPrices: any[], 
    checkin: string, 
    checkout: string
  ): Array<{price: number, nights: number}> {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const totalNights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const coverage: Array<{price: number, nights: number}> = [];
    let currentDate = new Date(checkin);
    
    for (let night = 0; night < totalNights; night++) {
      // Trova il prezzo settimanale che copre questa data
      const weekPrice = weeklyPrices.find(price => {
        const weekStart = new Date(price.week_start);
        const weekEnd = new Date(price.week_end);
        return currentDate >= weekStart && currentDate <= weekEnd;
      });
      
      if (weekPrice) {
        // Cerca se abbiamo già questo prezzo nella copertura
        const existingPeriod = coverage.find(p => p.price === weekPrice.price);
        if (existingPeriod) {
          existingPeriod.nights++;
        } else {
          coverage.push({ price: weekPrice.price, nights: 1 });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return coverage;
  }

  // Verifica disponibilità appartamento
  static async checkAvailability(
    apartmentId: number,
    checkin: string,
    checkout: string
  ): Promise<boolean> {
    const cacheKey = `availability_${apartmentId}_${checkin}_${checkout}`;

    return this.getOrSetCache(cacheKey, async () => {
      // Verifica conflitti con prenotazioni esistenti
      // Una prenotazione è in conflitto se: start_date < checkout AND end_date > checkin
      const { data: conflicts, error } = await supabase
        .from('reservations')
        .select('id, guest_name, start_date, end_date, apartment_ids')
        .filter('apartment_ids', 'cs', JSON.stringify([`appartamento-${apartmentId}`]))
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

      if (error) {
        // In caso di errore, assumiamo che sia disponibile per evitare blocchi
        return true;
      }

      const hasConflicts = (conflicts && conflicts.length > 0) || (dateBlocks && dateBlocks.length > 0);
      return !hasConflicts;
    });
  }

  // Calcolo sconto per occupazione (sconti ridotti per bassa occupazione)
  static calculateOccupancyDiscount(occupiedBeds: number, totalBeds: number): number {
    const occupancyRate = occupiedBeds / totalBeds;

    if (occupancyRate >= 1.0) return 0;      // 100% = prezzo pieno
    if (occupancyRate >= 0.75) return 5;     // 75-99% = -5%
    if (occupancyRate >= 0.50) return 10;    // 50-74% = -10%
    return 15;                               // <50% = -15% (max sconto)
  }

  // Distribuzione intelligente ospiti tra appartamenti
  static distributeGuestsAcrossApartments(
    totalGuests: number, 
    selectedApartments: number[], 
    targetApartmentId?: number
  ): number {
    if (targetApartmentId) {
      // Se richiesto per un appartamento specifico, calcola la sua porzione
      // NOTA: Capacità devono corrispondere a src/data/apartments.ts
      const apartmentCapacities: Record<number, number> = {
        1: 6,  // appartamento-1
        2: 8,  // appartamento-2
        3: 4,  // appartamento-3
        4: 5   // appartamento-4
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

  // Arrotondamento a multipli di 50 (sempre per difetto, a favore del cliente)
  static roundToMultipleOf50(price: number): number {
    return Math.floor(price / 50) * 50;
  }

  // Calcolo preventivo totale
  static async calculateQuote(params: QuoteParams): Promise<QuoteResult> {
    try {
      // Verifica disponibilità per tutti gli appartamenti
      const availabilityChecks = await Promise.all(
        params.apartments.map(async (id) => {
          return await this.checkAvailability(id, params.checkin, params.checkout);
        })
      );

      if (availabilityChecks.some(available => !available)) {
        throw new Error('Uno o più appartamenti non sono disponibili nelle date selezionate');
      }

      let baseTotal = 0;
      const apartmentDetails: ApartmentQuoteDetail[] = [];
      const totalGuestsInBeds = params.adults + params.children - params.childrenNoBed;

      // Traccia se c'è almeno un appartamento con occupazione < 100%
      let hasPartialOccupancy = false;

      // Calcola prezzo base per ogni appartamento (senza sconto percentuale)
      for (const apartmentId of params.apartments) {
        const apartment = await this.getApartmentDetails(apartmentId);
        const basePrice = await this.getPriceForPeriod(apartmentId, params.checkin, params.checkout);

        // Calcola occupazione per questo appartamento
        const occupiedBeds = this.distributeGuestsAcrossApartments(
          totalGuestsInBeds,
          params.apartments,
          apartmentId
        );

        // Verifica se occupazione è parziale
        if (occupiedBeds < apartment.beds) {
          hasPartialOccupancy = true;
        }

        // Per ora salviamo i dettagli senza sconto (verrà calcolato dopo)
        apartmentDetails.push({
          apartmentId,
          apartment,
          basePrice,
          occupiedBeds,
          discountPercent: 0,  // Verrà aggiornato
          discountAmount: 0,   // Verrà aggiornato
          finalPrice: basePrice  // Verrà aggiornato
        });

        baseTotal += basePrice;
      }

      // Calcola costi extra
      let extrasTotal = 0;
      if (params.hasPet) {
        const petCount = (params as any).petCount || 1;
        extrasTotal += petCount * 50;
      }
      if (params.needsLinen) {
        extrasTotal += totalGuestsInBeds * 15;
      }

      // Calcola il totale grezzo e il target arrotondato per difetto
      const rawTotal = baseTotal + extrasTotal;
      const finalTotal = this.roundToMultipleOf50(rawTotal);

      // Lo sconto è la differenza (sempre >= 0 perché arrotondiamo per difetto)
      const discountTotal = rawTotal - finalTotal;

      // Determina il tipo di sconto
      let discountType: 'occupancy' | 'courtesy' | 'none';
      if (discountTotal === 0) {
        discountType = 'none';
      } else if (hasPartialOccupancy) {
        discountType = 'occupancy';
      } else {
        discountType = 'courtesy';
      }

      // Aggiorna i dettagli appartamento con lo sconto distribuito proporzionalmente
      if (discountTotal > 0) {
        for (const detail of apartmentDetails) {
          const proportion = detail.basePrice / baseTotal;
          detail.discountAmount = Math.round(discountTotal * proportion);
          detail.discountPercent = Math.round((detail.discountAmount / detail.basePrice) * 100);
          detail.finalPrice = detail.basePrice - detail.discountAmount;
        }

        // Correggi eventuali errori di arrotondamento sull'ultimo appartamento
        const totalDistributed = apartmentDetails.reduce((sum, d) => sum + d.discountAmount, 0);
        if (totalDistributed !== discountTotal && apartmentDetails.length > 0) {
          const lastDetail = apartmentDetails[apartmentDetails.length - 1];
          lastDetail.discountAmount += (discountTotal - totalDistributed);
          lastDetail.finalPrice = lastDetail.basePrice - lastDetail.discountAmount;
          lastDetail.discountPercent = Math.round((lastDetail.discountAmount / lastDetail.basePrice) * 100);
        }
      }

      return {
        apartmentDetails,
        baseTotal,
        discountTotal,
        discountType,
        extrasTotal,
        finalTotal,
        deposit: this.roundToMultipleOf50(Math.round(finalTotal * 0.3)),
        balance: finalTotal - this.roundToMultipleOf50(Math.round(finalTotal * 0.3))
      };

    } catch (error) {
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
      return data.id;
      
    } catch (error) {
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
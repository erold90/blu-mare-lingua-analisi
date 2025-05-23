
/**
 * Servizio che simula le risposte del database quando il server API non è disponibile
 */

import { DataType } from "@/services/externalStorage";

// Definisci i tipi per le simulazioni
type MockData = {
  [key in DataType]?: any[];
};

// Dati di esempio per simulare le risposte del database
const mockDataSamples: MockData = {
  [DataType.RESERVATIONS]: [
    {
      id: "mock-res-1",
      guestName: "Mario Rossi",
      adults: 2,
      children: 1,
      cribs: 0,
      hasPets: false,
      apartmentIds: ["apt-1"],
      startDate: "2025-06-01",
      endDate: "2025-06-07",
      finalPrice: 700,
      paymentMethod: "cash",
      paymentStatus: "deposit",
      depositAmount: 200,
      notes: "Esempio prenotazione simulata",
      lastUpdated: Date.now()
    },
    {
      id: "mock-res-2",
      guestName: "Giulia Bianchi",
      adults: 4,
      children: 0,
      cribs: 0,
      hasPets: true,
      apartmentIds: ["apt-2"],
      startDate: "2025-07-15",
      endDate: "2025-07-22",
      finalPrice: 900,
      paymentMethod: "transfer",
      paymentStatus: "paid",
      depositAmount: 300,
      notes: "Porta un cane piccolo",
      lastUpdated: Date.now() - 86400000 // ieri
    }
  ],
  [DataType.CLEANING_TASKS]: [
    {
      id: "mock-clean-1",
      apartmentId: "apt-1",
      apartmentName: "Appartamento Mare",
      date: "2025-06-07",
      status: "pending",
      notes: "Pulizia completa post check-out",
      assignedTo: "Pulizie Rapide SRL",
      lastUpdated: Date.now()
    },
    {
      id: "mock-clean-2",
      apartmentId: "apt-2",
      apartmentName: "Appartamento Montagna",
      date: "2025-07-22",
      status: "assigned",
      notes: "Pulizia standard e cambio biancheria",
      assignedTo: "CleanPro",
      lastUpdated: Date.now() - 86400000
    }
  ],
  [DataType.APARTMENTS]: [
    {
      id: "apt-1",
      name: "Appartamento Mare",
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      description: "Bellissimo appartamento vista mare"
    },
    {
      id: "apt-2",
      name: "Appartamento Montagna",
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 2,
      description: "Spazioso appartamento con vista montagna"
    }
  ]
};

/**
 * Simula le risposte API quando il server non è disponibile
 */
export class MockDatabaseService {
  /**
   * Verifica se il servizio di simulazione è attivo
   */
  static isActive(): boolean {
    return localStorage.getItem("use_mock_database") === "true";
  }

  /**
   * Attiva o disattiva il servizio di simulazione
   */
  static toggleActive(active: boolean): void {
    localStorage.setItem("use_mock_database", active ? "true" : "false");
  }

  /**
   * Simula un test di connessione al database
   */
  static testConnection(): Promise<{success: boolean, data?: any}> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (MockDatabaseService.isActive()) {
          resolve({
            success: true,
            data: { connected: true, message: "Mock database connection successful" }
          });
        } else {
          resolve({
            success: false,
            error: "Mock database connection failed"
          });
        }
      }, 800); // Simula un ritardo di rete
    });
  }

  /**
   * Simula il caricamento di dati dal database
   */
  static loadData<T>(type: DataType): Promise<T | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = mockDataSamples[type] || [];
        console.log(`Mock database: Loaded ${data.length} items for ${type}`);
        resolve(data as unknown as T);
      }, 1000); // Simula un ritardo di rete
    });
  }

  /**
   * Simula il salvataggio di dati nel database
   */
  static saveData<T>(type: DataType, data: T): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Mock database: Saved data for ${type}`, data);
        mockDataSamples[type] = Array.isArray(data) ? [...data] : [data];
        resolve(true);
      }, 1500); // Simula un ritardo di rete più lungo per il salvataggio
    });
  }

  /**
   * Simula la sincronizzazione dei dati
   */
  static synchronize(type: DataType): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Mock database: Synchronized data for ${type}`);
        // Salva il timestamp di sincronizzazione
        const now = Date.now();
        localStorage.setItem(`last_sync_${type}`, now.toString());
        resolve();
      }, 2000); // Simula un processo di sincronizzazione più lungo
    });
  }
}

// Esporta un'istanza singleton del servizio
export const mockDatabaseService = new MockDatabaseService();

/**
 * Configurazione centralizzata degli appartamenti
 * Usare questa configurazione in tutto il progetto per evitare duplicazioni
 */

export interface ApartmentConfig {
  id: number;
  stringId: string;
  name: string;
  shortName: string;
  beds: number;
  description: string;
}

export const APARTMENTS: ApartmentConfig[] = [
  {
    id: 1,
    stringId: 'appartamento-1',
    name: 'Appartamento 1 (6 posti)',
    shortName: 'App. 1',
    beds: 6,
    description: 'Appartamento spazioso con 6 posti letto'
  },
  {
    id: 2,
    stringId: 'appartamento-2',
    name: 'Appartamento 2 (8 posti)',
    shortName: 'App. 2',
    beds: 8,
    description: 'Appartamento grande con 8 posti letto'
  },
  {
    id: 3,
    stringId: 'appartamento-3',
    name: 'Appartamento 3 (4 posti)',
    shortName: 'App. 3',
    beds: 4,
    description: 'Appartamento accogliente con 4 posti letto'
  },
  {
    id: 4,
    stringId: 'appartamento-4',
    name: 'Appartamento 4 (5 posti)',
    shortName: 'App. 4',
    beds: 5,
    description: 'Appartamento confortevole con 5 posti letto'
  }
];

// Helper per ottenere un appartamento per ID numerico
export function getApartmentById(id: number): ApartmentConfig | undefined {
  return APARTMENTS.find(apt => apt.id === id);
}

// Helper per ottenere un appartamento per ID stringa
export function getApartmentByStringId(stringId: string): ApartmentConfig | undefined {
  return APARTMENTS.find(apt => apt.stringId === stringId);
}

// Helper per ottenere il nome dell'appartamento
export function getApartmentName(id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id.replace('appartamento-', '')) : id;
  const apt = getApartmentById(numericId);
  return apt?.name || `Appartamento ${numericId}`;
}

// Helper per ottenere il nome breve dell'appartamento
export function getApartmentShortName(id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id.replace('appartamento-', '')) : id;
  const apt = getApartmentById(numericId);
  return apt?.shortName || `App. ${numericId}`;
}

// Mapping per ID numerici
export const APARTMENT_NAMES_BY_ID: Record<number, string> = Object.fromEntries(
  APARTMENTS.map(apt => [apt.id, apt.name])
);

// Mapping per ID stringa
export const APARTMENT_NAMES_BY_STRING_ID: Record<string, string> = Object.fromEntries(
  APARTMENTS.map(apt => [apt.stringId, apt.name])
);

// Mapping completo (numerico + stringa)
export const APARTMENT_NAMES: Record<string, string> = {
  ...Object.fromEntries(APARTMENTS.map(apt => [apt.id.toString(), apt.name])),
  ...APARTMENT_NAMES_BY_STRING_ID
};

// Capacità totale
export const TOTAL_CAPACITY = APARTMENTS.reduce((sum, apt) => sum + apt.beds, 0);

// Numero totale appartamenti
export const APARTMENT_COUNT = APARTMENTS.length;

/**
 * Configurazione centralizzata degli appartamenti
 * Usata per evitare duplicazione e garantire consistenza in tutta l'applicazione
 */

export interface ApartmentConfig {
  id: number;
  stringId: string;
  name: string;
  shortName: string;
  beds: number;
}

export const APARTMENTS: ApartmentConfig[] = [
  { id: 1, stringId: 'appartamento-1', name: 'Appartamento 1 (6 posti)', shortName: 'App. 1', beds: 6 },
  { id: 2, stringId: 'appartamento-2', name: 'Appartamento 2 (8 posti)', shortName: 'App. 2', beds: 8 },
  { id: 3, stringId: 'appartamento-3', name: 'Appartamento 3 (4 posti)', shortName: 'App. 3', beds: 4 },
  { id: 4, stringId: 'appartamento-4', name: 'Appartamento 4 (5 posti)', shortName: 'App. 4', beds: 5 }
];

// Mappature per accesso rapido
export const APARTMENT_NAMES: Record<string, string> = {
  '1': 'Appartamento 1 (6 posti)',
  '2': 'Appartamento 2 (8 posti)',
  '3': 'Appartamento 3 (4 posti)',
  '4': 'Appartamento 4 (5 posti)',
  'appartamento-1': 'Appartamento 1 (6 posti)',
  'appartamento-2': 'Appartamento 2 (8 posti)',
  'appartamento-3': 'Appartamento 3 (4 posti)',
  'appartamento-4': 'Appartamento 4 (5 posti)'
};

export const APARTMENT_NAMES_BY_ID: Record<number, string> = {
  1: 'Appartamento 1 (6 posti)',
  2: 'Appartamento 2 (8 posti)',
  3: 'Appartamento 3 (4 posti)',
  4: 'Appartamento 4 (5 posti)'
};

export const APARTMENT_NAMES_BY_STRING_ID: Record<string, string> = {
  'appartamento-1': 'Appartamento 1 (6 posti)',
  'appartamento-2': 'Appartamento 2 (8 posti)',
  'appartamento-3': 'Appartamento 3 (4 posti)',
  'appartamento-4': 'Appartamento 4 (5 posti)'
};

export const APARTMENT_BEDS: Record<number, number> = {
  1: 6,
  2: 8,
  3: 4,
  4: 5
};

// Funzioni di utilità
export function getApartmentById(id: number): ApartmentConfig | undefined {
  return APARTMENTS.find(apt => apt.id === id);
}

export function getApartmentByStringId(stringId: string): ApartmentConfig | undefined {
  return APARTMENTS.find(apt => apt.stringId === stringId);
}

export function getApartmentName(id: number | string): string {
  const apartment = typeof id === 'number'
    ? APARTMENTS.find(apt => apt.id === id)
    : APARTMENTS.find(apt => apt.stringId === id || apt.id.toString() === id);
  return apartment?.name || `Appartamento ${id}`;
}

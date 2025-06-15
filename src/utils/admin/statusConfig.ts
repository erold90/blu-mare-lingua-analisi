
// Configurazione centralizzata per tutti gli stati dell'area admin
export const PAYMENT_STATUS = {
  notPaid: { label: "Non Pagato", color: "bg-red-100 text-red-800 border-red-200" },
  deposit: { label: "Caparra", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  paid: { label: "Pagato", color: "bg-green-100 text-green-800 border-green-200" }
} as const;

export const CLEANING_STATUS = {
  pending: { label: "In Attesa", color: "bg-gray-100 text-gray-800 border-gray-200" },
  inProgress: { label: "In Corso", color: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "Completata", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Annullata", color: "bg-red-100 text-red-800 border-red-200" }
} as const;

export const CLEANING_PRIORITY = {
  low: { label: "Bassa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" }
} as const;

export const APARTMENT_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-purple-500", "bg-pink-500", "bg-indigo-500"
];

// Utility functions per ottenere le configurazioni
export const getPaymentStatusConfig = (status: keyof typeof PAYMENT_STATUS) => 
  PAYMENT_STATUS[status] || PAYMENT_STATUS.notPaid;

export const getCleaningStatusConfig = (status: keyof typeof CLEANING_STATUS) => 
  CLEANING_STATUS[status] || CLEANING_STATUS.pending;

export const getCleaningPriorityConfig = (priority: keyof typeof CLEANING_PRIORITY) => 
  CLEANING_PRIORITY[priority] || CLEANING_PRIORITY.medium;

export const getApartmentColor = (index: number) => 
  APARTMENT_COLORS[index % APARTMENT_COLORS.length];

// Formatters per i valori di display
export const formatPaymentStatus = (status: string, depositAmount?: number) => {
  if (status === "deposit" && depositAmount) {
    return `Caparra: €${depositAmount}`;
  }
  return getPaymentStatusConfig(status as keyof typeof PAYMENT_STATUS).label;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

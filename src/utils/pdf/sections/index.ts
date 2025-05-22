
// Export all section generators from a central location
export { generateClientSection } from './clientSection';
export { generateStayDetailsSection } from './stayDetailsSection';
export { generateApartmentSection } from './apartmentSection';
export { generateCostsTable } from './costsSection';
export { generateNotesSection } from './notesSection';
export { generatePaymentMethodsSection } from './paymentSection';

// New quote sections
export { generateQuoteHeader } from './quoteHeaderSection';
export { generateClientInfoSection } from './clientInfoSection';
export { generateStayInfoSection } from './stayInfoSection';
export { generateApartmentListSection } from './apartmentListSection';
export { generateCostsTableSection } from './costsTableSection';
export { generateTotalsSection } from './totalsSection';
export { generateSecurityDepositSection } from './securityDepositSection';
export { generateTermsSection } from './termsSection';

// Include tables from the refactored tables directory
export * from '../tables';

// Shared PDF utilities
export * from '../utils/pdfSharedUtils';

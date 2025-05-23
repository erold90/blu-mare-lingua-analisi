
import React, { createContext, useContext } from 'react';
import { PricesContextType } from './types';
import { useSupabasePrices } from './useSupabasePrices';

const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const SupabasePricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pricesValue = useSupabasePrices();

  return (
    <PricesContext.Provider value={pricesValue}>
      {children}
    </PricesContext.Provider>
  );
};

export const useSupabasePricesContext = () => {
  const context = useContext(PricesContext);
  if (context === undefined) {
    throw new Error('useSupabasePricesContext must be used within a SupabasePricesProvider');
  }
  return context;
};

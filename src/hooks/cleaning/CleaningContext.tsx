
import React, { createContext, useContext } from "react";
import { CleaningContextType } from "./types";

// Create the context
const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

// Create a hook to use the cleaning context
export const useCleaningContext = () => {
  const context = useContext(CleaningContext);
  
  if (context === undefined) {
    throw new Error("useCleaningContext deve essere usato all'interno di un CleaningProvider");
  }
  
  return context;
};

export default CleaningContext;

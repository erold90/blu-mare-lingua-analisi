
import { useContext } from "react";
import CleaningContext from "./CleaningContext";
import type { CleaningContextType } from "../useCleaningManagement";

export const useCleaningContext = (): CleaningContextType => {
  const context = useContext(CleaningContext);
  if (!context) {
    throw new Error("useCleaningContext must be used within a CleaningProvider");
  }
  return context;
};


import { useContext } from "react";
import CleaningContext from "./CleaningContext";
import type { CleaningContextType } from "../useCleaningManagement";

// Safe version that returns null if context is not available
export const useSafeCleaningContext = (): CleaningContextType | null => {
  const context = useContext(CleaningContext);
  return context || null;
};

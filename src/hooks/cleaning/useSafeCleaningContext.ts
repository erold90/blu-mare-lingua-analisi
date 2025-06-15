
import { useContext } from "react";
import CleaningContext from "./CleaningContext";
import type { CleaningContextType } from "../useCleaningManagement";

export const useSafeCleaningContext = (): CleaningContextType | null => {
  const context = useContext(CleaningContext);
  return context || null;
};

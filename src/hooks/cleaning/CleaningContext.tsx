
import { createContext } from "react";
import type { CleaningContextType } from "../useCleaningManagement";

const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

export default CleaningContext;

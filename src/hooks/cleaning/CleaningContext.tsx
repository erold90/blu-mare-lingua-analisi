
import { createContext } from "react";
import { CleaningContextType } from "../useCleaningManagement";

const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

export default CleaningContext;

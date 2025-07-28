
import { createContext } from "react";
import type { CleaningContextType } from "./types";

export const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

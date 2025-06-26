
import * as React from "react";
import { useOptimizedTracking } from "@/hooks/analytics/useOptimizedTracking";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Attiva il tracking ottimizzato delle pagine
  useOptimizedTracking();

  return <>{children}</>;
};

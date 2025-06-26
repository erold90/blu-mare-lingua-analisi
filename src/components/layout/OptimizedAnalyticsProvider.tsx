
import * as React from "react";
import { useOptimizedTracking } from "@/hooks/analytics/useOptimizedTracking";

interface OptimizedAnalyticsProviderProps {
  children: React.ReactNode;
}

export const OptimizedAnalyticsProvider = ({ children }: OptimizedAnalyticsProviderProps) => {
  // Usa il sistema di tracking completamente ottimizzato
  useOptimizedTracking();

  return <>{children}</>;
};

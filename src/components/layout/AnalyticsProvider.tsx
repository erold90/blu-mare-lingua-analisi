
import * as React from "react";
import { usePageTracking } from "@/hooks/analytics/usePageTracking";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Attiva il tracking automatico delle pagine
  usePageTracking();

  return <>{children}</>;
};

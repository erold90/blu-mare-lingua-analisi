
import * as React from "react";
import { useAdvancedTracking } from "@/hooks/analytics/useAdvancedTracking";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Il hook si occupa automaticamente del tracking
  useAdvancedTracking();

  return <>{children}</>;
};


import * as React from "react";
import { useSimpleTracking } from "@/hooks/analytics/useSimpleTracking";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Use simplified unified tracking system
  useSimpleTracking();

  return <>{children}</>;
};

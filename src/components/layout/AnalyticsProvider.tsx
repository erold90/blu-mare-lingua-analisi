
import * as React from "react";
import { useTracking } from "@/hooks/analytics/useTracking";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Use simplified unified tracking system
  useTracking();

  return <>{children}</>;
};

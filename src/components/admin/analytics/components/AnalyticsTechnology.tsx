
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone } from "lucide-react";

interface AnalyticsTechnologyProps {
  visitorSessions: any[];
}

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const AnalyticsTechnology = ({ visitorSessions }: AnalyticsTechnologyProps) => {
  const browserData = visitorSessions?.reduce((acc, session) => {
    const browser = toString(session.browser) || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const osData = visitorSessions?.reduce((acc, session) => {
    const os = toString(session.operating_system) || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topBrowsers = Object.entries(browserData)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 6);

  const topOs = Object.entries(osData)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topBrowsers.map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>{toString(browser) || 'Unknown'}</span>
                </div>
                <Badge variant="outline">{toNumber(count)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistemi Operativi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topOs.map(([os, count]) => (
              <div key={os} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>{toString(os) || 'Unknown'}</span>
                </div>
                <Badge variant="outline">{toNumber(count)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

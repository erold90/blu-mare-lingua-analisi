
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Eye } from "lucide-react";

interface AnalyticsTrafficProps {
  visitorSessions: any[];
  pageViews: any[];
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

export const AnalyticsTraffic = ({ visitorSessions, pageViews }: AnalyticsTrafficProps) => {
  const countryData = visitorSessions?.reduce((acc, session) => {
    const country = toString(session.country) || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topCountries = Object.entries(countryData)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const topPages = pageViews?.reduce((acc, view) => {
    const page = toString(view.page_url) || 'Unknown';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topPagesData = Object.entries(topPages)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Top Paesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCountries.map((country, index) => (
              <div key={country.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{toString(country.name) || 'Unknown'}</span>
                </div>
                <Badge variant="outline">{toNumber(country.value)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagine Più Visitate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPagesData.slice(0, 8).map((page, index) => (
              <div key={page.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{toString(page.name) || 'Unknown'}</span>
                </div>
                <Badge variant="outline">{toNumber(page.value)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { AnalyticsMetrics, SiteVisit } from "@/hooks/analytics/useAnalyticsCore";

interface AdminLogAnalyticsProps {
  siteVisits: SiteVisit[];
  dateRange: any;
  metrics: AnalyticsMetrics;
}

export const AdminLogAnalytics = ({ siteVisits, dateRange, metrics }: AdminLogAnalyticsProps) => {
  const visitChartData = React.useMemo(() => {
    if (!dateRange?.from || siteVisits.length === 0) return [];
    
    const chartData = [];
    let currentDate = new Date(dateRange.from);
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date(currentDate);
    
    // Limita a 14 giorni per performance
    const daysDiff = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 14) {
      endDate.setDate(currentDate.getDate() + 14);
    }
    
    while (currentDate <= endDate && chartData.length < 14) {
      const day = format(currentDate, 'dd/MM', { locale: it });
      const count = siteVisits.filter(visit => {
        const visitDate = new Date(visit.created_at);
        return isSameDay(visitDate, currentDate);
      }).length;
      
      chartData.push({ name: day, visits: count });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return chartData;
  }, [siteVisits, dateRange?.from, dateRange?.to]);

  const pageDistribution = React.useMemo(() => {
    if (siteVisits.length === 0) return [];
    
    const pageCount = siteVisits.reduce((acc, visit) => {
      acc[visit.page] = (acc[visit.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(pageCount)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [siteVisits]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Andamento visite</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Sistema ottimizzato v2</Badge>
              <Badge variant="secondary">Max 14 giorni</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {visitChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} visite`, "Visite"]}
                      labelFormatter={(value: string) => `Giorno: ${value}`}
                    />
                    <Bar dataKey="visits" fill="#8b87f5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Nessun dato disponibile per il periodo selezionato</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagine più visitate</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Top 10</Badge>
              <Badge variant="secondary">Ultimi 30 giorni</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pageDistribution.length > 0 ? (
                pageDistribution.map((item, index) => (
                  <div key={item.page} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm truncate max-w-[200px]">{item.page}</span>
                    </div>
                    <Badge variant="secondary">{item.count} visite</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Nessun dato disponibile
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

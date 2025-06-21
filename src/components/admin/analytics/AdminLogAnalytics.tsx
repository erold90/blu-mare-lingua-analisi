
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";

interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
}

interface AdminLogAnalyticsProps {
  siteVisits: SiteVisit[];
  getVisitsCount: (period: 'day' | 'month' | 'year') => number;
  dateRange: any;
}

export const AdminLogAnalytics = ({ siteVisits, getVisitsCount, dateRange }: AdminLogAnalyticsProps) => {
  const visitChartData = React.useMemo(() => {
    if (!dateRange?.from) return [];
    
    const chartData = [];
    let currentDate = new Date(dateRange.from);
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date(currentDate);
    
    // Limit to 30 days for performance
    const daysDiff = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      endDate.setDate(currentDate.getDate() + 30);
    }
    
    while (currentDate <= endDate) {
      const day = format(currentDate, 'dd/MM', { locale: it });
      const count = siteVisits.filter(visit => {
        const visitDate = new Date(visit.timestamp);
        return isSameDay(visitDate, currentDate);
      }).length;
      
      chartData.push({ name: day, visits: count });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return chartData;
  }, [siteVisits, dateRange]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visite oggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVisitsCount('day')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visite uniche al sito
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visite questo mese</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVisitsCount('month')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance ottimizzata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visite quest'anno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVisitsCount('year')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Database Supabase
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Andamento visite</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Ottimizzato per performance</Badge>
            <Badge variant="secondary">Max 30 giorni</Badge>
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
                    formatter={(value: any) => [`${value} visite`, "Visite"]}
                    labelFormatter={(value: any) => `Giorno: ${value}`}
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
    </>
  );
};

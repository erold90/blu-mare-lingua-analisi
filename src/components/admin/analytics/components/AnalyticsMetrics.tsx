
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, MousePointer, TrendingUp } from "lucide-react";

interface AnalyticsMetricsProps {
  visitorSessions: any[];
  pageViews: any[];
  interactions: any[];
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const AnalyticsMetrics = ({ visitorSessions, pageViews, interactions }: AnalyticsMetricsProps) => {
  const totalVisitors = visitorSessions?.length || 0;
  const totalPageViews = pageViews?.length || 0;
  const totalInteractions = interactions?.length || 0;
  
  const avgSessionDuration = visitorSessions?.length 
    ? visitorSessions.reduce((acc, session) => {
        const duration = toNumber(session.session_duration);
        return acc + duration;
      }, 0) / visitorSessions.length
    : 0;
    
  const bounceRate = visitorSessions?.length 
    ? (visitorSessions.filter(s => Boolean(s.is_bounce)).length / visitorSessions.length) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Visitatori Unici
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVisitors}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Nel periodo selezionato
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizzazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPageViews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Pagine viste totali
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Interazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInteractions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Click tracciati
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Durata Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgSessionDuration)}s</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sessione media
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bounceRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sessioni single-page
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

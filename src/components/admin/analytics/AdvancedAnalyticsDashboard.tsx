
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useAnalyticsData, AnalyticsFilters } from "@/hooks/analytics/useAnalyticsData";
import { CalendarIcon, Globe, Monitor, Smartphone, Users, Eye, MousePointer, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface DateRange {
  from?: Date;
  to?: Date;
}

const COLORS = ['#8b87f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Helper function to safely convert to number
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to safely convert to string
const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

export const AdvancedAnalyticsDashboard = () => {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: subDays(new Date(), 7).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { 
    dailyAnalytics, 
    visitorSessions, 
    pageViews, 
    interactions, 
    loading, 
    error, 
    refreshData,
    aggregateDailyAnalytics 
  } = useAnalyticsData(filters);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setFilters(prev => ({
        ...prev,
        startDate: range.from ? range.from.toISOString().split('T')[0] : undefined,
        endDate: range.to ? range.to.toISOString().split('T')[0] : undefined,
      }));
    }
  };

  const handleRefresh = async () => {
    await aggregateDailyAnalytics();
    await refreshData();
  };

  // Calcola metriche principali con type guards e safe operations
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

  // Prepara dati per i grafici con type safety
  const dailyVisitorsData = dailyAnalytics?.map(day => ({
    date: format(new Date(day.date), 'dd/MM', { locale: it }),
    visitors: toNumber(day.unique_visitors),
    pageViews: toNumber(day.total_page_views),
  })) || [];

  const deviceData = visitorSessions?.reduce((acc, session) => {
    const device = toString(session.device_type) || 'Unknown';
    const currentCount = toNumber(acc[device]) || 0;
    acc[device] = currentCount + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const deviceChartData = Object.entries(deviceData).map(([name, value]) => ({ name, value }));

  const countryData = visitorSessions?.reduce((acc, session) => {
    const country = toString(session.country) || 'Unknown';
    const currentCount = toNumber(acc[country]) || 0;
    acc[country] = currentCount + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topCountries = Object.entries(countryData)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const topPages = pageViews?.reduce((acc, view) => {
    const page = toString(view.page_url) || 'Unknown';
    const currentCount = toNumber(acc[page]) || 0;
    acc[page] = currentCount + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topPagesData = Object.entries(topPages)
    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Caricamento analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Errore nel caricamento dei dati analytics: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Avanzati</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Seleziona periodo</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={handleDateRangeChange}
                locale={it}
                numberOfMonths={isMobile ? 1 : 2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Metriche principali */}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="traffic">Traffico</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="technology">Tecnologia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Andamento Visitatori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyVisitorsData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="visitors" stroke="#8b87f5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interazioni Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {interactions?.slice(0, 20).map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4" />
                      <div>
                        <span className="text-sm font-medium">{toString(interaction.interaction_type) || 'Unknown'}</span>
                        {interaction.element_text && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {toString(interaction.element_text)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(interaction.timestamp), 'HH:mm dd/MM', { locale: it })}
                    </span>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Browser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    visitorSessions?.reduce((acc, session) => {
                      const browser = toString(session.browser) || 'Unknown';
                      const currentCount = toNumber(acc[browser]) || 0;
                      acc[browser] = currentCount + 1;
                      return acc;
                    }, {} as Record<string, number>) || {}
                  )
                    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
                    .slice(0, 6)
                    .map(([browser, count]) => (
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
                  {Object.entries(
                    visitorSessions?.reduce((acc, session) => {
                      const os = toString(session.operating_system) || 'Unknown';
                      const currentCount = toNumber(acc[os]) || 0;
                      acc[os] = currentCount + 1;
                      return acc;
                    }, {} as Record<string, number>) || {}
                  )
                    .sort(([,a], [,b]) => toNumber(b) - toNumber(a))
                    .slice(0, 6)
                    .map(([os, count]) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

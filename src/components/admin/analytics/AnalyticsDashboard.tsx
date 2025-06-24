
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useUnifiedAnalytics, AnalyticsFilters } from "@/hooks/analytics/useUnifiedAnalytics";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnalyticsMetrics } from "./components/AnalyticsMetrics";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { AnalyticsTraffic } from "./components/AnalyticsTraffic";
import { AnalyticsBehavior } from "./components/AnalyticsBehavior";
import { AnalyticsTechnology } from "./components/AnalyticsTechnology";

interface DateRange {
  from?: Date;
  to?: Date;
}

export const AnalyticsDashboard = () => {
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
  } = useUnifiedAnalytics(filters);

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
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
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

      <AnalyticsMetrics 
        visitorSessions={visitorSessions}
        pageViews={pageViews}
        interactions={interactions}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="traffic">Traffico</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="technology">Tecnologia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AnalyticsCharts 
            dailyAnalytics={dailyAnalytics}
            visitorSessions={visitorSessions}
          />
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <AnalyticsTraffic 
            visitorSessions={visitorSessions}
            pageViews={pageViews}
          />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <AnalyticsBehavior interactions={interactions} />
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <AnalyticsTechnology visitorSessions={visitorSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

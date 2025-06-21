
import * as React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useActivityLog } from "@/hooks/activity/useActivityLog";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLogAnalytics } from "./analytics/AdminLogAnalytics";
import { AdminLogQuotes } from "./quotes/AdminLogQuotes";

const AdminLog = () => {
  const { quoteLogs, siteVisits, getVisitsCount, loading, refreshData } = useActivityLog();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  // Debug logging - reduced frequency
  React.useEffect(() => {
    console.log("AdminLog - Site visits data:", siteVisits.length);
    console.log("AdminLog - Quote logs:", quoteLogs.length);
  }, [siteVisits.length, quoteLogs.length]); // Only log when counts change
  
  // Single mount effect - no auto refresh to prevent loops
  React.useEffect(() => {
    console.log("AdminLog mounted");
    // Don't auto-refresh on mount to prevent loops
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento dati...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log delle Attività</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
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
                  <span>Seleziona date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                locale={it}
                numberOfMonths={isMobile ? 1 : 2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => {
            console.log("Manual refresh triggered");
            refreshData();
          }} variant="outline" size="sm">
            Aggiorna Dati
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visite</TabsTrigger>
          <TabsTrigger value="quotes">Preventivi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Sistema di tracciamento attivo</p>
                <p className="text-green-700 text-sm">
                  Totale visite caricate: {siteVisits.length}. Le visite vengono tracciate automaticamente.
                </p>
              </div>
            </div>
          </div>
          
          <AdminLogAnalytics 
            siteVisits={siteVisits} 
            getVisitsCount={getVisitsCount} 
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6 space-y-6">
          <AdminLogQuotes 
            quoteLogs={quoteLogs} 
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLog;


import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";
import YearPriceGrid from "./YearPriceGrid";
import YearSelector from "./YearSelector";

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

const CompactPriceManager: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const { isLoading, getSeasonWeeks, prices, updatePrice, reloadPrices } = useCompactPrices();

  // Memoize render info to prevent unnecessary logs
  const renderInfo = useMemo(() => {
    const info = {
      pricesCount: prices.length,
      isLoading,
      weeksCount: getSeasonWeeks(selectedYear).length,
      isMobile: window.innerWidth < 768
    };
    console.log("CompactPriceManager render:", info);
    return info;
  }, [prices.length, isLoading, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reloadPrices} 
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Caricamento..." : "Aggiorna"}
          </Button>
        </div>
      </div>
      
      <YearSelector
        years={AVAILABLE_YEARS}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      
      {isLoading ? (
        <Card>
          <CardContent className="py-10 flex justify-center items-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Caricamento prezzi in corso...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <YearPriceGrid 
          year={selectedYear} 
          prices={prices}
          getSeasonWeeks={getSeasonWeeks}
          updatePrice={updatePrice}
        />
      )}
    </div>
  );
};

export default CompactPriceManager;


import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";
import YearPriceGrid from "./YearPriceGrid";
import YearSelector from "./YearSelector";

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

const CompactPriceManager: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [needsInitialization, setNeedsInitialization] = useState<boolean>(false);
  const { 
    isLoading, 
    getSeasonWeeks, 
    prices, 
    updatePrice, 
    reloadPrices, 
    initializeDefaultPrices 
  } = useCompactPrices();

  // Check if we need to initialize prices
  useEffect(() => {
    if (!isLoading && prices.length === 0) {
      setNeedsInitialization(true);
    } else {
      setNeedsInitialization(false);
    }
  }, [isLoading, prices.length]);

  // Handle initialization of default prices
  const handleInitializePrices = async () => {
    await initializeDefaultPrices(selectedYear);
    setNeedsInitialization(false);
  };

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
      
      {needsInitialization && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prezzi non inizializzati</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Non ci sono prezzi configurati per l'anno {selectedYear}.</span>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleInitializePrices}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Inizializzazione...
                </>
              ) : (
                "Inizializza Prezzi"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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

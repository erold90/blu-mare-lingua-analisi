
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useUnifiedPrices } from "@/hooks/useUnifiedPrices";
import UnifiedPriceManager from "./prices/UnifiedPriceManager";

const AdminPrices: React.FC = () => {
  const { prices, initializeDefaultPrices, isLoading, currentYear } = useUnifiedPrices();
  
  useEffect(() => {
    // Controlla se i prezzi devono essere inizializzati al primo caricamento
    if (!isLoading && prices.length === 0 && currentYear === 2025) {
      console.log("🚀 No prices found for 2025, initializing default prices...");
      initializeDefaultPrices(2025);
    }
  }, [isLoading, prices.length, currentYear, initializeDefaultPrices]);

  const handleInitializeAllYears = async () => {
    for (let year = 2025; year <= 2030; year++) {
      await initializeDefaultPrices(year);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Prezzi</h1>
        <Button 
          onClick={handleInitializeAllYears} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Inizializzazione...
            </>
          ) : (
            "Inizializza tutti gli anni (2025-2030)"
          )}
        </Button>
      </div>
      <UnifiedPriceManager />
    </div>
  );
};

export default AdminPrices;

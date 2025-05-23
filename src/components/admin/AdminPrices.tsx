
import React, { useEffect } from "react";
import CompactPriceManager from "./prices/CompactPriceManager";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const AdminPrices: React.FC = () => {
  const { prices, initializeAllYears, isLoading } = useCompactPrices();
  
  useEffect(() => {
    // Check if prices need to be initialized on first load
    // This will initialize all years 2025-2030 if no prices exist
    if (!isLoading && prices.length === 0) {
      console.log("🚀 No prices found, initializing all years 2025-2030...");
      initializeAllYears();
    }
  }, [isLoading, prices.length, initializeAllYears]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Prezzi</h1>
        <Button 
          onClick={initializeAllYears} 
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
      <CompactPriceManager />
    </div>
  );
};

export default AdminPrices;

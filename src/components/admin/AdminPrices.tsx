
import React from "react";
import { RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PriceManagementProvider, usePriceManagement } from "@/hooks/usePriceManagement";
import PriceGrid from "./prices/PriceGrid";
import PriceStats from "./prices/PriceStats";

const AdminPricesContent: React.FC = () => {
  const { initializePrices, isLoading } = usePriceManagement();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestione Prezzi</h2>
          <p className="text-muted-foreground mt-1">
            Gestisci i prezzi settimanali per la stagione 2025
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={initializePrices}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reinizializza Prezzi
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          I prezzi sono impostati per settimana (da lunedì a domenica) per la stagione 2025. 
          La stagione va dal 2 giugno al 5 ottobre. Clicca sull'icona matita per modificare un prezzo.
        </AlertDescription>
      </Alert>

      <PriceStats />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prezzi per Appartamento</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Caricamento prezzi...</span>
              </div>
            </div>
          ) : (
            <PriceGrid />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPrices: React.FC = () => {
  return (
    <PriceManagementProvider>
      <AdminPricesContent />
    </PriceManagementProvider>
  );
};

export default AdminPrices;

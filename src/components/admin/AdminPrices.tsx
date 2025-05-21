
import * as React from "react";
import { usePrices } from "@/hooks/usePrices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseZap } from "lucide-react";
import { toast } from "sonner";
import PriceEditor from "./prices/PriceEditor";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminPrices = () => {
  const { 
    availableYears,
    selectedYear,
    setSelectedYear,
    resetPrices,
    isLoading,
    getWeeksForYear
  } = usePrices();
  
  const isMobile = useIsMobile();
  const weeks = getWeeksForYear(selectedYear);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetPrices}
          className="flex items-center gap-1"
        >
          <DatabaseZap className="h-4 w-4" />
          Reimposta Prezzi
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Prezzi Settimanali</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>I prezzi sono da intendersi per settimana (da sabato a sabato).</p>
          </div>
          
          <Tabs 
            defaultValue={selectedYear.toString()} 
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
            className="w-full"
          >
            <TabsList className="mb-4 w-full sm:w-auto">
              {availableYears.map(year => (
                <TabsTrigger key={year} value={year.toString()}>
                  {year}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {availableYears.map(year => (
              <TabsContent key={year} value={year.toString()}>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <p className="text-muted-foreground">Caricamento prezzi in corso...</p>
                  </div>
                ) : (
                  <PriceEditor 
                    year={year}
                    weeks={weeks}
                    isMobile={isMobile}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPrices;

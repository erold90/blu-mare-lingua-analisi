import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Euro, Calendar, TrendingUp } from 'lucide-react';
import { useCompactPrices } from '@/hooks/useCompactPrices';
import { apartments } from '@/data/apartments';
import PriceEditableCell from './PriceEditableCell';
import PriceMobileView from './PriceMobileView';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculatePriceStats, getPriceLevel } from '@/hooks/prices/priceUtils';

const CompactPriceManager: React.FC = () => {
  const { 
    prices, 
    isLoading, 
    getSeasonWeeks, 
    getPrice, 
    updatePrice, 
    editingCell, 
    setEditingCell,
    reloadPrices 
  } = useCompactPrices();
  
  const isMobile = useIsMobile();
  const weeks = getSeasonWeeks();

  // Debug: log dello stato
  console.log("CompactPriceManager render:", {
    pricesCount: prices.length,
    isLoading,
    weeksCount: weeks.length,
    isMobile
  });

  const calculateStats = () => {
    const totalPrices = prices.length;
    const avgPrice = totalPrices > 0 ? prices.reduce((sum, p) => sum + p.price, 0) / totalPrices : 0;
    const maxPrice = totalPrices > 0 ? Math.max(...prices.map(p => p.price)) : 0;
    const minPrice = totalPrices > 0 ? Math.min(...prices.map(p => p.price)) : 0;
    
    return { totalPrices, avgPrice: Math.round(avgPrice), maxPrice, minPrice };
  };

  const stats = calculatePriceStats(prices);

  if (isMobile) {
    return <PriceMobileView />;
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Euro className="h-6 w-6" />
            Gestione Prezzi 2025
          </h2>
          <p className="text-muted-foreground mt-1">
            Modifica veloce dei prezzi settimanali - Stagione giugno-settembre
          </p>
          {/* Debug info */}
          <p className="text-xs text-muted-foreground mt-1">
            Debug: {prices.length} prezzi caricati, {weeks.length} settimane
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={reloadPrices}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Ricarica
        </Button>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prezzi totali</p>
                <p className="text-2xl font-bold">{stats.totalPrices}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prezzo medio</p>
                <p className="text-2xl font-bold">€{stats.avgPrice}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prezzo max</p>
                <p className="text-2xl font-bold text-red-600">€{stats.maxPrice}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <Euro className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prezzo min</p>
                <p className="text-2xl font-bold text-green-600">€{stats.minPrice}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Euro className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legenda livelli prezzo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium">Livelli prezzo:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              €350-449 Low Season
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              €450-699 Medium Season
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              €700-999 High Season
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              €1000+ Peak Season
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabella prezzi compatta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prezzi per Settimana</CardTitle>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-sm">Appartamento</th>
                    {weeks.map((week, idx) => (
                      <th key={idx} className="text-center py-3 px-1 font-medium text-xs min-w-[80px]">
                        <div className="flex flex-col">
                          <span>{week.label}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {week.start.getDate()}-{week.end.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apartments.map(apartment => (
                    <tr key={apartment.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-2 font-medium text-sm">
                        <div className="flex flex-col">
                          <span>{apartment.name}</span>
                          <span className="text-xs text-muted-foreground">{apartment.capacity} posti</span>
                        </div>
                      </td>
                      {weeks.map((week, idx) => {
                        const price = getPrice(apartment.id, week.startStr);
                        const priceLevel = getPriceLevel(price);
                        
                        // Debug log per ogni cella
                        console.log(`Price for ${apartment.id} on ${week.startStr}: ${price}`);
                        
                        return (
                          <td key={idx} className="py-1 px-1 text-center">
                            <PriceEditableCell
                              apartmentId={apartment.id}
                              weekStart={week.startStr}
                              price={price}
                              priceLevel={priceLevel}
                              isEditing={editingCell?.apartmentId === apartment.id && editingCell?.weekStart === week.startStr}
                              onEdit={() => setEditingCell({ apartmentId: apartment.id, weekStart: week.startStr })}
                              onSave={(newPrice) => {
                                updatePrice(apartment.id, week.startStr, newPrice);
                                setEditingCell(null);
                              }}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactPriceManager;

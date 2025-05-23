
import React from 'react';
import { TrendingUp, Calendar, Euro, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apartments } from '@/data/apartments';
import { usePriceManagement } from '@/hooks/usePriceManagement';

const PriceStats: React.FC = () => {
  const { getPriceForWeek, getSeasonWeeks } = usePriceManagement();
  const weeks = getSeasonWeeks();

  const calculateStats = () => {
    let totalRevenue = 0;
    let weekCount = 0;
    const apartmentStats: { [key: string]: { total: number; avg: number; min: number; max: number } } = {};

    apartments.forEach(apartment => {
      let apartmentTotal = 0;
      let apartmentMin = Infinity;
      let apartmentMax = 0;

      weeks.forEach(week => {
        const price = getPriceForWeek(apartment.id, week.startStr);
        apartmentTotal += price;
        totalRevenue += price;
        weekCount++;
        
        if (price > 0) {
          apartmentMin = Math.min(apartmentMin, price);
          apartmentMax = Math.max(apartmentMax, price);
        }
      });

      apartmentStats[apartment.id] = {
        total: apartmentTotal,
        avg: Math.round(apartmentTotal / weeks.length),
        min: apartmentMin === Infinity ? 0 : apartmentMin,
        max: apartmentMax
      };
    });

    return {
      totalRevenue,
      avgWeeklyPrice: Math.round(totalRevenue / weekCount),
      apartmentStats,
      totalWeeks: weeks.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ricavi Totali Stagione</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Per tutti gli appartamenti
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prezzo Medio Settimanale</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.avgWeeklyPrice}</div>
          <p className="text-xs text-muted-foreground">
            Media di tutti gli appartamenti
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Settimane Stagione</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWeeks}</div>
          <p className="text-xs text-muted-foreground">
            Da giugno a settembre
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appartamento Top</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {(() => {
            const topApartment = apartments.reduce((best, apartment) => {
              const currentAvg = stats.apartmentStats[apartment.id]?.avg || 0;
              const bestAvg = stats.apartmentStats[best.id]?.avg || 0;
              return currentAvg > bestAvg ? apartment : best;
            });
            
            return (
              <div>
                <div className="text-2xl font-bold">{topApartment.name}</div>
                <p className="text-xs text-muted-foreground">
                  €{stats.apartmentStats[topApartment.id]?.avg} media
                </p>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceStats;

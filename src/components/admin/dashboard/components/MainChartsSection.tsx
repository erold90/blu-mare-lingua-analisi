
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

// Import existing chart components
import { SummerRevenueChart } from "../SummerRevenueChart";
import { GuestDistributionChart } from "../GuestDistributionChart";
import { MonthlyReservationsChart } from "../MonthlyReservationsChart";
import { SummerOccupancy } from "../SummerOccupancy";

interface MainChartsSectionProps {
  data: any;
}

const MainChartsSection: React.FC<MainChartsSectionProps> = ({ data }) => {
  const {
    summerMonthlyRevenue,
    guestDistribution,
    reservationsByMonth,
    summerOccupancy
  } = data;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Analisi e Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="occupancy">Occupazione</TabsTrigger>
            <TabsTrigger value="reservations">Prenotazioni</TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Ospiti
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <SummerRevenueChart summerMonthlyRevenue={summerMonthlyRevenue} />
          </TabsContent>
          
          <TabsContent value="occupancy" className="space-y-4">
            <SummerOccupancy summerOccupancy={summerOccupancy} />
          </TabsContent>
          
          <TabsContent value="reservations" className="space-y-4">
            <MonthlyReservationsChart reservationsByMonth={reservationsByMonth} />
          </TabsContent>
          
          <TabsContent value="guests" className="space-y-4">
            <GuestDistributionChart guestDistribution={guestDistribution} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MainChartsSection;

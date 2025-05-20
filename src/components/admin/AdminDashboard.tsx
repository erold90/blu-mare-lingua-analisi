
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useReservations } from "@/hooks/useReservations";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

const AdminDashboard = () => {
  const { reservations, apartments } = useReservations();
  
  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + (reservation.finalPrice || 0);
    }, 0);
  }, [reservations]);

  // Calculate occupancy percentage for summer season (June to September)
  const summerOccupancy = React.useMemo(() => {
    const result: { name: string; occupancy: number }[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const summerStart = new Date(year, 5, 1); // June 1
    const summerEnd = new Date(year, 8, 30); // September 30
    const totalDays = 122; // Approximate days in summer season
    
    // For each apartment, calculate days occupied in summer
    apartments.forEach(apt => {
      const apartmentReservations = reservations.filter(r => 
        r.apartmentIds.includes(apt.id));
      
      let daysOccupied = 0;
      apartmentReservations.forEach(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Check if reservation overlaps with summer
        if (startDate <= summerEnd && endDate >= summerStart) {
          // Calculate overlap
          const overlapStart = startDate > summerStart ? startDate : summerStart;
          const overlapEnd = endDate < summerEnd ? endDate : summerEnd;
          
          // Add days to count
          const diffTime = overlapEnd.getTime() - overlapStart.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          daysOccupied += diffDays;
        }
      });
      
      const occupancyPercentage = Math.round((daysOccupied / totalDays) * 100);
      result.push({
        name: `Appartamento ${apt.name}`,
        occupancy: occupancyPercentage
      });
    });
    
    return result;
  }, [reservations, apartments]);

  // Summer monthly revenue data (only June to September)
  const summerMonthlyRevenue = React.useMemo(() => {
    const data: { name: string; revenue: number }[] = [];
    const summerMonths = ["Giu", "Lug", "Ago", "Set"];
    const summerMonthIndices = [5, 6, 7, 8]; // June is 5, September is 8
    const revenueByMonth: number[] = Array(4).fill(0);
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      
      // Only count if it's a summer month (June-September)
      const summerIndex = summerMonthIndices.indexOf(month);
      if (summerIndex !== -1) {
        revenueByMonth[summerIndex] += (reservation.finalPrice || 0);
      }
    });
    
    summerMonths.forEach((month, i) => {
      data.push({
        name: month,
        revenue: revenueByMonth[i]
      });
    });
    
    return data;
  }, [reservations]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Guadagno Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        {/* Total Reservations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prenotazioni Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>
        
        {/* Occupancy Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasso di Occupazione Estivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summerOccupancy.reduce((acc, curr) => acc + curr.occupancy, 0) / 
                (summerOccupancy.length || 1))}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Summer Occupancy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Occupazione Estiva per Appartamento</CardTitle>
          <CardDescription>Percentuale di occupazione da giugno a settembre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summerOccupancy.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.occupancy}%</div>
                </div>
                <Progress value={item.occupancy} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Summer Monthly Revenue Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Guadagno Mensile Estivo</CardTitle>
          <CardDescription>Distribuzione delle entrate da giugno a settembre</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="h-[300px] w-full mt-4">
            <ChartContainer 
              config={{
                revenue: { theme: { light: "#34d399", dark: "#34d399" } },
              }}
            >
              <BarChart 
                data={summerMonthlyRevenue} 
                margin={{ left: 30, right: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const month = data.payload.name;
                      const revenue = data.payload.revenue;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p className="font-medium">{month}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Guadagno totale: <span className="font-semibold text-foreground">€{revenue.toLocaleString()}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" name="Guadagno" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

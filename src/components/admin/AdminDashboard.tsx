
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

const AdminDashboard = () => {
  const { reservations, apartments } = useReservations();
  
  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + (reservation.finalPrice || 0);
    }, 0);
  }, [reservations]);

  // Calculate total reservations per apartment
  const reservationsPerApartment = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    reservations.forEach(reservation => {
      reservation.apartmentIds.forEach(id => {
        if (!counts[id]) counts[id] = 0;
        counts[id]++;
      });
    });
    
    return counts;
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
        name: apt.name,
        occupancy: occupancyPercentage
      });
    });
    
    return result;
  }, [reservations, apartments]);

  // Monthly revenue data
  const monthlyRevenue = React.useMemo(() => {
    const data: { name: string; revenue: number }[] = [];
    const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    const revenueByMonth: number[] = Array(12).fill(0);
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      revenueByMonth[month] += (reservation.finalPrice || 0);
    });
    
    months.forEach((month, i) => {
      data.push({
        name: month,
        revenue: revenueByMonth[i]
      });
    });
    
    return data;
  }, [reservations]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {summerOccupancy.reduce((acc, curr) => acc + curr.occupancy, 0) / 
                (summerOccupancy.length || 1)}%
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
          <div className="space-y-4">
            {summerOccupancy.map((item) => (
              <div key={item.name} className="space-y-2">
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
      
      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Guadagno Mensile</CardTitle>
          <CardDescription>Distribuzione mensile delle entrate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`€${value}`, 'Guadagno']}
                />
                <Legend />
                <Bar dataKey="revenue" name="Guadagno" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

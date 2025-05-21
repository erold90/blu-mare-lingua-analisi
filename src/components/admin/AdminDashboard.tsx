
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useReservations } from "@/hooks/useReservations";
import { useCleaningManagement } from "@/hooks/useCleaningManagement";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { format, addDays, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Users, Building, Euro, CleaningIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CleaningProvider } from "@/hooks/useCleaningManagement";

// Colori per i grafici
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

// Wrapper con il provider di pulizia
const AdminDashboardWithProvider = () => (
  <CleaningProvider>
    <AdminDashboardContent />
  </CleaningProvider>
);

// Contenuto del dashboard che utilizza il provider
const AdminDashboardContent = () => {
  const { reservations, apartments } = useReservations();
  const { cleaningTasks } = useCleaningManagement();
  const isMobile = useIsMobile();
  
  // Calcola il numero di prenotazioni future
  const futureReservations = React.useMemo(() => {
    const today = new Date();
    return reservations.filter(res => new Date(res.startDate) >= today).length;
  }, [reservations]);

  // Calcola le pulizie da fare
  const pendingCleanings = React.useMemo(() => {
    return cleaningTasks.filter(task => task.status !== "completed").length;
  }, [cleaningTasks]);
  
  // Calcola il totale degli ospiti attesi
  const totalGuests = React.useMemo(() => {
    return reservations.reduce((acc, res) => {
      return acc + res.adults + res.children;
    }, 0);
  }, [reservations]);
  
  // Calcola il revenue totale
  const totalRevenue = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + (reservation.finalPrice || 0);
    }, 0);
  }, [reservations]);

  // Calcola occupancy percentage per la stagione estiva (Giugno-Settembre)
  const summerOccupancy = React.useMemo(() => {
    const result: { name: string; occupancy: number }[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const summerStart = new Date(year, 5, 1); // 1 Giugno
    const summerEnd = new Date(year, 8, 30); // 30 Settembre
    const totalDays = 122; // Giorni approssimativi nella stagione estiva
    
    // Per ogni appartamento, calcola i giorni occupati in estate
    apartments.forEach(apt => {
      const apartmentReservations = reservations.filter(r => 
        r.apartmentIds.includes(apt.id));
      
      let daysOccupied = 0;
      apartmentReservations.forEach(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Controlla se la prenotazione si sovrappone all'estate
        if (startDate <= summerEnd && endDate >= summerStart) {
          // Calcola la sovrapposizione
          const overlapStart = startDate > summerStart ? startDate : summerStart;
          const overlapEnd = endDate < summerEnd ? endDate : summerEnd;
          
          // Aggiungi i giorni al conteggio
          const diffTime = overlapEnd.getTime() - overlapStart.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          daysOccupied += diffDays;
        }
      });
      
      const occupancyPercentage = Math.round((daysOccupied / totalDays) * 100);
      result.push({
        name: `${apt.name}`,
        occupancy: occupancyPercentage
      });
    });
    
    return result;
  }, [reservations, apartments]);

  // Revenue mensile estivo (solo da Giugno a Settembre)
  const summerMonthlyRevenue = React.useMemo(() => {
    const data: { name: string; revenue: number }[] = [];
    const summerMonths = ["Giu", "Lug", "Ago", "Set"];
    const summerMonthIndices = [5, 6, 7, 8]; // Giugno è 5, Settembre è 8
    const revenueByMonth: number[] = Array(4).fill(0);
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      
      // Conta solo se è un mese estivo (Giugno-Settembre)
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
  
  // Distribuzione delle prenotazioni per mese
  const reservationsByMonth = React.useMemo(() => {
    const data = Array(12).fill(0).map((_, i) => ({
      name: format(new Date(2023, i, 1), "MMM", { locale: it }),
      count: 0
    }));
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      data[month].count++;
    });
    
    return data;
  }, [reservations]);
  
  // Distribuzione degli ospiti per tipologia
  const guestDistribution = React.useMemo(() => {
    const totalAdults = reservations.reduce((acc, res) => acc + res.adults, 0);
    const totalChildren = reservations.reduce((acc, res) => acc + res.children, 0);
    const totalCribs = reservations.reduce((acc, res) => acc + (res.cribs || 0), 0);
    
    return [
      { name: "Adulti", value: totalAdults },
      { name: "Bambini", value: totalChildren },
      { name: "Culle", value: totalCribs }
    ];
  }, [reservations]);
  
  // Prossimi check-in e check-out
  const upcomingMovements = React.useMemo(() => {
    const today = new Date();
    const next7Days = addDays(today, 7);
    
    return reservations
      .filter(res => {
        const checkIn = new Date(res.startDate);
        const checkOut = new Date(res.endDate);
        
        return (checkIn >= today && checkIn <= next7Days) || 
               (checkOut >= today && checkOut <= next7Days);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [reservations]);
  
  // Prenotazioni attive oggi
  const activeReservations = React.useMemo(() => {
    const today = new Date();
    
    return reservations.filter(res => {
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      
      return isWithinInterval(today, { start: startDate, end: endDate });
    });
  }, [reservations]);
  
  // Statistische delle pulizie
  const cleaningStats = React.useMemo(() => {
    const total = cleaningTasks.length;
    const completed = cleaningTasks.filter(t => t.status === "completed").length;
    const inProgress = cleaningTasks.filter(t => t.status === "inProgress").length;
    const pending = cleaningTasks.filter(t => t.status === "pending").length;
    
    const data = [
      { name: "Completate", value: completed },
      { name: "In corso", value: inProgress },
      { name: "Da fare", value: pending }
    ];
    
    return {
      data,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [cleaningTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Panoramica dell'attività di Villa MareBlu
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prenotazioni Future */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prenotazioni Future
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{futureReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Prenotazioni da gestire
            </p>
          </CardContent>
        </Card>
        
        {/* Pulizie da Fare */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pulizie da Fare
            </CardTitle>
            <CleaningIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCleanings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Attività di pulizia pendenti
            </p>
          </CardContent>
        </Card>
        
        {/* Totale Ospiti */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Ospiti
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Persone ospitate
            </p>
          </CardContent>
        </Card>
        
        {/* Guadagno Totale */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Guadagno Totale
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Incasso complessivo
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Prenotazioni Attive */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Prenotazioni Attive</CardTitle>
            <CardDescription>Ospiti attualmente presenti</CardDescription>
          </CardHeader>
          <CardContent>
            {activeReservations.length > 0 ? (
              <div className="space-y-4">
                {activeReservations.map(res => (
                  <div key={res.id} className="flex flex-col border rounded-md p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <div className="font-medium">{res.guestName}</div>
                        <div className="text-sm text-muted-foreground">
                          {res.adults} adulti, {res.children} bambini
                          {res.cribs > 0 && `, ${res.cribs} culle`}
                        </div>
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <div className="font-medium">
                          {format(new Date(res.startDate), "d MMM", { locale: it })} - {format(new Date(res.endDate), "d MMM", { locale: it })}
                        </div>
                        <div className="text-muted-foreground text-right">
                          € {res.finalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {res.apartmentIds.map(aptId => {
                        const apt = apartments.find(a => a.id === aptId);
                        return apt && (
                          <Badge key={aptId} variant="outline">
                            {apt.name}
                          </Badge>
                        );
                      })}
                      {res.hasPets && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          Animali
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Nessuna prenotazione attiva oggi
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Occupazione Estiva */}
        <Card>
          <CardHeader>
            <CardTitle>Occupazione Estiva</CardTitle>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guadagno Mensile Estivo */}
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
                              Guadagno: <span className="font-semibold text-foreground">€{revenue.toLocaleString()}</span>
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
        
        {/* Distribuzione degli ospiti */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Ospiti</CardTitle>
            <CardDescription>Tipologie di ospiti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={guestDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {guestDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Numero: <span className="font-semibold text-foreground">{data.value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Prenotazioni per mese */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Prenotazioni per Mese</CardTitle>
            <CardDescription>Distribuzione annuale delle prenotazioni</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="h-[300px] w-full mt-4">
              <ChartContainer 
                config={{
                  count: { theme: { light: "#8b5cf6", dark: "#8b5cf6" } },
                }}
              >
                <LineChart 
                  data={reservationsByMonth} 
                  margin={{ left: 30, right: 15, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={8} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Prenotazioni: <span className="font-semibold text-foreground">
                                {payload[0].value}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Prenotazioni" 
                    stroke="var(--color-count)" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Statistiche Pulizie */}
        <Card>
          <CardHeader>
            <CardTitle>Stato Pulizie</CardTitle>
            <CardDescription>Panoramica delle attività di pulizia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="h-[150px] w-[150px]">
                  <ChartContainer config={{}}>
                    <PieChart>
                      <Pie
                        data={cleaningStats.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        <Cell fill="#10b981" name="Completate" />
                        <Cell fill="#f59e0b" name="In corso" />
                        <Cell fill="#6b7280" name="Da fare" />
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Numero: <span className="font-semibold text-foreground">{data.value}</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-3xl font-bold">{cleaningStats.completionRate}%</div>
                  <div className="text-xs text-muted-foreground">Completate</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              {cleaningStats.data.map((item, index) => (
                <div key={index} className="p-2">
                  <div className="text-xl font-bold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Prossimi check-in/check-out */}
      <Card>
        <CardHeader>
          <CardTitle>Prossimi Movimenti</CardTitle>
          <CardDescription>Check-in e check-out nei prossimi 7 giorni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
            {upcomingMovements.map(res => {
              const checkIn = new Date(res.startDate);
              const checkOut = new Date(res.endDate);
              const today = new Date();
              
              const isCheckInSoon = checkIn >= today && checkIn <= addDays(today, 7);
              const isCheckOutSoon = checkOut >= today && checkOut <= addDays(today, 7);
              
              return (
                <div key={res.id} className="border rounded-md p-4">
                  <div className="font-medium">{res.guestName}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {res.apartmentIds.map(aptId => {
                      const apt = apartments.find(a => a.id === aptId);
                      return apt?.name;
                    }).join(", ")}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isCheckInSoon && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Check-in {format(checkIn, "d MMM", { locale: it })}
                      </Badge>
                    )}
                    {isCheckOutSoon && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        Check-out {format(checkOut, "d MMM", { locale: it })}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {upcomingMovements.length === 0 && (
              <div className="col-span-full p-8 text-center text-muted-foreground">
                Nessun movimento previsto nei prossimi 7 giorni
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente di export
const AdminDashboard = () => {
  return <AdminDashboardWithProvider />;
};

export default AdminDashboard;

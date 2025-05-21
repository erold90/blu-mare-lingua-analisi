
import * as React from "react";
import { CleaningProvider } from "@/hooks/cleaning";
import { useDashboardData } from "./useDashboardData";
import { DashboardMetrics } from "./DashboardMetrics";
import { ActiveReservations } from "./ActiveReservations";
import { SummerOccupancy } from "./SummerOccupancy";
import { SummerRevenueChart } from "./SummerRevenueChart";
import { GuestDistributionChart } from "./GuestDistributionChart";
import { MonthlyReservationsChart } from "./MonthlyReservationsChart";
import { CleaningStats } from "./CleaningStats";
import { UpcomingMovements } from "./UpcomingMovements";

// Wrapper con il provider di pulizia
const AdminDashboardWithProvider = () => (
  <CleaningProvider>
    <AdminDashboardContent />
  </CleaningProvider>
);

// Contenuto del dashboard che utilizza il provider
const AdminDashboardContent = () => {
  const {
    futureReservations,
    pendingCleanings,
    totalGuests,
    totalRevenue,
    summerOccupancy,
    summerMonthlyRevenue,
    reservationsByMonth,
    guestDistribution,
    activeReservations,
    upcomingMovements,
    cleaningStats,
    apartments
  } = useDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Panoramica dell'attività di Villa MareBlu
        </p>
      </div>
      
      <DashboardMetrics
        futureReservations={futureReservations}
        pendingCleanings={pendingCleanings}
        totalGuests={totalGuests}
        totalRevenue={totalRevenue}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActiveReservations 
          activeReservations={activeReservations}
          apartments={apartments}
        />
        <SummerOccupancy summerOccupancy={summerOccupancy} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummerRevenueChart summerMonthlyRevenue={summerMonthlyRevenue} />
        <GuestDistributionChart guestDistribution={guestDistribution} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MonthlyReservationsChart reservationsByMonth={reservationsByMonth} />
        <CleaningStats cleaningStats={cleaningStats} />
      </div>
      
      <UpcomingMovements 
        upcomingMovements={upcomingMovements} 
        apartments={apartments}
      />
    </div>
  );
};

// Componente di export
const AdminDashboard = () => {
  return <AdminDashboardWithProvider />;
};

export default AdminDashboard;

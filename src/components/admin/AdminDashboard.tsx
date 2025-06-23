
import * as React from "react";
import { useReservations } from "@/hooks/useReservations";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { ActiveReservations } from "./dashboard/ActiveReservations";
import { UpcomingMovements } from "./dashboard/UpcomingMovements";
import AvailableWeeksSummary from "./dashboard/AvailableWeeksSummary";
import { addDays } from "date-fns";

const AdminDashboard = () => {
  const { reservations, apartments, isLoading } = useReservations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate metrics
  const today = new Date();
  const activeReservations = reservations.filter(res => {
    const startDate = new Date(res.startDate);
    const endDate = new Date(res.endDate);
    return today >= startDate && today <= endDate;
  });

  const upcomingMovements = reservations.filter(res => {
    const startDate = new Date(res.startDate);
    const endDate = new Date(res.endDate);
    const weekFromNow = addDays(today, 7);
    
    return (startDate >= today && startDate <= weekFromNow) || 
           (endDate >= today && endDate <= weekFromNow);
  });

  // Calculate dashboard metrics
  const futureReservations = reservations.filter(res => {
    const startDate = new Date(res.startDate);
    return startDate > today;
  }).length;

  const pendingCleanings = 0; // This would need to be calculated from cleaning tasks
  
  const totalGuests = reservations.reduce((total, res) => {
    return total + (res.adults || 0) + (res.children || 0);
  }, 0);

  const totalRevenue = reservations.reduce((total, res) => {
    return total + (res.finalPrice || 0);
  }, 0);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Panoramica generale delle prenotazioni e attività
        </p>
      </div>

      <DashboardMetrics 
        futureReservations={futureReservations}
        pendingCleanings={pendingCleanings}
        totalGuests={totalGuests}
        totalRevenue={totalRevenue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActiveReservations 
          activeReservations={activeReservations}
          apartments={apartments}
        />
        
        <div className="lg:col-span-2">
          <AvailableWeeksSummary />
        </div>
      </div>

      <UpcomingMovements 
        upcomingMovements={upcomingMovements}
        apartments={apartments}
      />
    </div>
  );
};

export default AdminDashboard;

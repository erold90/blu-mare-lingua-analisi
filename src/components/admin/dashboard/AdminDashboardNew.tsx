
import * as React from "react";
import { CleaningProvider } from "@/hooks/cleaning";
import { useDashboardData } from "./useDashboardData";

// Import new refactored components
import DashboardHeader from "./components/DashboardHeader";
import QuickStatsGrid from "./components/QuickStatsGrid";
import MainChartsSection from "./components/MainChartsSection";
import OperationalSection from "./components/OperationalSection";
import RecentActivitySection from "./components/RecentActivitySection";

const AdminDashboardContent = React.memo(() => {
  const dashboardData = useDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        <QuickStatsGrid data={dashboardData} />
        <MainChartsSection data={dashboardData} />
        <OperationalSection data={dashboardData} />
        <RecentActivitySection data={dashboardData} />
      </div>
    </div>
  );
});

AdminDashboardContent.displayName = "AdminDashboardContent";

const AdminDashboard = () => {
  return (
    <CleaningProvider>
      <AdminDashboardContent />
    </CleaningProvider>
  );
};

export default AdminDashboard;


import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Admin components imports
import AdminLayoutNew from "@/components/admin/AdminLayoutNew";
import AdminDashboardNew from "@/components/admin/dashboard/AdminDashboardNew";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminPrices from "@/components/admin/AdminPrices";
import AdminApartments from "@/components/admin/AdminApartments";
import AdminSettings from "@/components/admin/AdminSettings";
import { AdminCleaningManagement } from "@/components/admin/cleaning/AdminCleaningManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { SiteImageManager } from "@/components/admin/images/SiteImageManager";
import { ReservationsProvider } from "@/hooks/useReservations";
import { SupabasePricesProvider } from "@/hooks/useSupabasePrices";
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider";


const ReservedAreaPage = () => {
  return (
    <ProtectedRoute>
      <AnalyticsProvider>
        <ReservationsProvider>
          <SupabasePricesProvider>
            <Routes>
              <Route path="/*" element={<AdminLayoutNew />}>
                <Route path="dashboard" element={<AdminDashboardNew />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="apartments" element={<AdminApartments />} />
                <Route path="prices" element={<AdminPrices />} />
                <Route path="cleaning" element={<AdminCleaningManagement />} />
                <Route path="images" element={<SiteImageManager />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Routes>
          </SupabasePricesProvider>
        </ReservationsProvider>
      </AnalyticsProvider>
    </ProtectedRoute>
  );
};

export default ReservedAreaPage;

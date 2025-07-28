import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminAuthProvider } from "@/components/auth/AdminAuthProvider";

// Admin components imports
import ModernAdminLayout from "@/components/admin/modern/ModernAdminLayout";
import { ModernDashboard } from "@/components/admin/modern/ModernDashboard";
import { ModernReservations } from "@/components/admin/modern/ModernReservations";
import AdminPrices from "@/components/admin/AdminPrices";
import AdminApartments from "@/components/admin/AdminApartments";
import AdminSettings from "@/components/admin/AdminSettings";
import { AdminCleaningManagement } from "@/components/admin/cleaning/AdminCleaningManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { SiteImageManager } from "@/components/admin/images/SiteImageManager";
import { ReservationsProvider } from "@/hooks/useReservations";
import { SupabasePricesProvider } from "@/hooks/price/SupabasePricesProvider";
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider";

const ReservedAreaPage = () => {
  return (
    <ProtectedRoute>
      <AnalyticsProvider>
        <ReservationsProvider>
          <SupabasePricesProvider>
            <Routes>
              <Route path="/*" element={<ModernAdminLayout />}>
                <Route path="dashboard" element={<ModernDashboard />} />
                <Route path="prenotazioni" element={<ModernReservations />} />
                <Route path="appartamenti" element={<AdminApartments />} />
                <Route path="prezzi" element={<AdminPrices />} />
                <Route path="pulizie" element={<AdminCleaningManagement />} />
                <Route path="immagini" element={<SiteImageManager />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="impostazioni" element={<AdminSettings />} />
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
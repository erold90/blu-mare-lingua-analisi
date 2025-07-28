import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReservationsProvider } from "@/hooks/useReservations";
import { SupabasePricesProvider } from "@/hooks/useSupabasePrices";
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider";

// Layout
import AdminLayout from "@/components/admin/AdminLayout";

// Pages
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminPrices from "@/components/admin/AdminPrices";
import AdminApartments from "@/components/admin/AdminApartments";
import AdminSettings from "@/components/admin/AdminSettings";
import { AdminCleaningManagement } from "@/components/admin/cleaning/AdminCleaningManagement";

const ReservedAreaPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <AnalyticsProvider>
        <ReservationsProvider>
          <SupabasePricesProvider>
            <Routes>
              <Route path="/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="prenotazioni" element={<AdminReservations />} />
                <Route path="appartamenti" element={<AdminApartments />} />
                <Route path="prezzi" element={<AdminPrices />} />
                <Route path="pulizie" element={<AdminCleaningManagement />} />
                <Route path="impostazioni" element={<AdminSettings />} />
                <Route index element={<AdminDashboard />} />
              </Route>
            </Routes>
          </SupabasePricesProvider>
        </ReservationsProvider>
      </AnalyticsProvider>
    </ProtectedRoute>
  );
};

export default ReservedAreaPage;
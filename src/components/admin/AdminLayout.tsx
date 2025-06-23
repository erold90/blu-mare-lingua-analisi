
import * as React from "react";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminReservations from "./AdminReservations";
import AdminApartments from "./AdminApartments";
import AdminPrices from "./AdminPrices";
import AdminCleaningManagement from "./cleaning/AdminCleaningManagement";
import { SiteImageManager } from "./images/SiteImageManager";
import AdminLog from "./AdminLog";
import AdminSettings from "./AdminSettings";
import {
  Users,
  Calendar,
  Building,
  Euro,
  Sparkles,
  Images,
  FileText,
  TrendingUp,
  Settings,
  Menu,
  X
} from "lucide-react";
import AdminAdvancedLog from "./AdminAdvancedLog";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="bg-gray-50 p-4 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 flex lg:static ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-blue-800`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 flex flex-col pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-lg font-semibold">
                Villa Mareblu - Admin
              </h1>
            </div>
            <nav
              className="mt-5 flex-1 px-2 bg-blue-800 space-y-1"
              aria-label="Sidebar"
            >
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Users className="h-5 w-5" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("reservations")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "reservations"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Calendar className="h-5 w-5" />
                Prenotazioni
              </button>

              <button
                onClick={() => setActiveTab("apartments")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "apartments"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Building className="h-5 w-5" />
                Appartamenti
              </button>

              <button
                onClick={() => setActiveTab("prices")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "prices"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Euro className="h-5 w-5" />
                Prezzi
              </button>

              <button
                onClick={() => setActiveTab("cleaning")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "cleaning"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Sparkles className="h-5 w-5" />
                Pulizie
              </button>

              <button
                onClick={() => setActiveTab("images")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "images"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Images className="h-5 w-5" />
                Immagini
              </button>

              <button
                onClick={() => setActiveTab("log")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "log"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <FileText className="h-5 w-5" />
                Log
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "analytics"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                Analytics Avanzati
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Settings className="h-5 w-5" />
                Impostazioni
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:flex-col">
        <div className="flex flex-col flex-grow bg-blue-800 pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-white text-lg font-semibold">
              Villa Mareblu - Admin
            </h1>
          </div>
          <nav
            className="mt-5 flex-1 flex flex-col bg-blue-800 space-y-1"
            aria-label="Sidebar"
          >
            {/* Same navigation buttons as mobile */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Users className="h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "reservations"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Calendar className="h-5 w-5" />
              Prenotazioni
            </button>

            <button
              onClick={() => setActiveTab("apartments")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "apartments"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Building className="h-5 w-5" />
              Appartamenti
            </button>

            <button
              onClick={() => setActiveTab("prices")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "prices"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Euro className="h-5 w-5" />
              Prezzi
            </button>

            <button
              onClick={() => setActiveTab("cleaning")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "cleaning"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              Pulizie
            </button>

            <button
              onClick={() => setActiveTab("images")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "images"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Images className="h-5 w-5" />
              Immagini
            </button>

            <button
              onClick={() => setActiveTab("log")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "log"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FileText className="h-5 w-5" />
              Log
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Analytics Avanzati
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Settings className="h-5 w-5" />
              Impostazioni
            </button>
          </nav>
        </div>
      </div>
      
      <main className="lg:pl-64">
        <div className="p-6">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "reservations" && <AdminReservations />}
          {activeTab === "apartments" && <AdminApartments />}
          {activeTab === "prices" && <AdminPrices />}
          {activeTab === "cleaning" && <AdminCleaningManagement />}
          {activeTab === "images" && <SiteImageManager />}
          {activeTab === "log" && <AdminLog />}
          {activeTab === "analytics" && <AdminAdvancedLog />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CleaningProvider, useCleaningManagement } from "@/hooks/cleaning";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import CleaningHeader from "./CleaningHeader";
import CalendarView from "./views/CalendarView";
import ListView from "./views/ListView";
import StatisticsView from "./views/StatisticsView";

// Componente principale avvolto nel provider
const AdminCleaningManagementWithProvider = () => (
  <CleaningProvider>
    <AdminCleaningManagementContent />
  </CleaningProvider>
);

// Contenuto interno che usa il context
const AdminCleaningManagementContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list" | "statistics">("calendar");
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <CleaningHeader 
        view={view}
        setView={setView}
        selectedApartment={selectedApartment}
        setSelectedApartment={setSelectedApartment}
      />
      
      {view === "calendar" && (
        <CalendarView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedApartment={selectedApartment}
          isMobile={isMobile}
        />
      )}
      
      {view === "list" && (
        <ListView
          selectedApartment={selectedApartment}
          isMobile={isMobile}
        />
      )}
      
      {view === "statistics" && (
        <StatisticsView />
      )}
    </div>
  );
};

// Esporta il componente avvolto nel provider
const AdminCleaningManagement = () => {
  return <AdminCleaningManagementWithProvider />;
};

export default AdminCleaningManagement;


import * as React from "react";
import { CleaningProvider } from "@/hooks/cleaning/CleaningProvider";
import CleaningDashboard from "./CleaningDashboard";

const AdminCleaningManagement = () => {
  return (
    <CleaningProvider>
      <CleaningDashboard />
    </CleaningProvider>
  );
};

export default AdminCleaningManagement;

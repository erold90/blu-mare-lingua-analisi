
import * as React from "react";
import AdminLogUnified from "./AdminLogUnified";

const AdminAdvancedLog = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Sistema Analytics Unificato</h3>
        <p className="text-blue-800 text-sm">
          Il sistema di analytics avanzati è stato unificato con il sistema di log base per eliminare duplicazioni e migliorare le performance.
        </p>
      </div>
      <AdminLogUnified />
    </div>
  );
};

export default AdminAdvancedLog;

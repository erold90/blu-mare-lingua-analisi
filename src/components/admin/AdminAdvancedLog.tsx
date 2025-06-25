
import * as React from "react";
import AdminLogUnified from "./AdminLogUnified";

const AdminAdvancedLog = () => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Sistema Analytics Semplificato</h3>
        <p className="text-green-800 text-sm">
          Il sistema analytics è stato semplificato per migliorare le performance. 
          Ora utilizza solo le tabelle essenziali (preventivi e visite) eliminando la complessità non necessaria.
        </p>
      </div>
      <AdminLogUnified />
    </div>
  );
};

export default AdminAdvancedLog;

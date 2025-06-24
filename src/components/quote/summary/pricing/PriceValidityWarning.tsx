
import React from "react";
import { AlertCircle } from "lucide-react";

interface PriceValidityWarningProps {
  pricesAreValid: boolean;
}

const PriceValidityWarning: React.FC<PriceValidityWarningProps> = ({ pricesAreValid }) => {
  if (pricesAreValid) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <span className="text-sm text-yellow-800">
        I prezzi potrebbero non essere aggiornati. Verifica nell'area riservata.
      </span>
    </div>
  );
};

export default PriceValidityWarning;


import React from "react";

interface ExtraServicesProps {
  extraServices: number;
  showExtraServices: boolean;
}

const ExtraServices: React.FC<ExtraServicesProps> = ({ extraServices, showExtraServices }) => {
  if (!showExtraServices) return null;

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Servizi extra:</span>
      <span className="font-medium">{extraServices}€</span>
    </div>
  );
};

export default ExtraServices;

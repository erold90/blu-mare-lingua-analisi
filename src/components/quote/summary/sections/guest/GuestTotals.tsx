
import React from "react";

interface GuestTotalsProps {
  totalGuests: number;
}

const GuestTotals: React.FC<GuestTotalsProps> = ({ totalGuests }) => {
  return (
    <div className="text-center p-4 bg-primary/5 rounded-lg">
      <div className="text-2xl font-bold text-primary mb-1">
        {totalGuests}
      </div>
      <div className="text-sm text-muted-foreground">
        Ospiti totali
      </div>
    </div>
  );
};

export default GuestTotals;

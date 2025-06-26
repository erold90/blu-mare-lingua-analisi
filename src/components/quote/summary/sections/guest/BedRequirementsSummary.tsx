
import React from "react";

interface BedRequirementsSummaryProps {
  effectiveGuestsForBeds: number;
  childrenUnder12: number;
  childrenNotOccupyingBed: number;
}

const BedRequirementsSummary: React.FC<BedRequirementsSummaryProps> = ({
  effectiveGuestsForBeds,
  childrenUnder12,
  childrenNotOccupyingBed
}) => {
  return (
    <div className="pt-2 border-t space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Posti letto necessari:</span>
        <span className="font-semibold text-primary">
          {effectiveGuestsForBeds}
        </span>
      </div>
      
      {childrenUnder12 > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Bambini esenti tassa:</span>
          <span className="font-semibold text-green-600">{childrenUnder12}</span>
        </div>
      )}
      
      {childrenNotOccupyingBed > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Bambini che non occupano letto:</span>
          <span className="font-semibold text-blue-600">{childrenNotOccupyingBed}</span>
        </div>
      )}
    </div>
  );
};

export default BedRequirementsSummary;

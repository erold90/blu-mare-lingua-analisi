
import React from "react";
import { Calendar } from "lucide-react";

interface PeriodInfoProps {
  checkIn?: Date | null;
  checkOut?: Date | null;
}

const PeriodInfo: React.FC<PeriodInfoProps> = ({ checkIn, checkOut }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 rounded">
      <Calendar className="h-4 w-4" />
      <span>
        {checkIn?.toLocaleDateString('it-IT')} - {checkOut?.toLocaleDateString('it-IT')}
      </span>
    </div>
  );
};

export default PeriodInfo;

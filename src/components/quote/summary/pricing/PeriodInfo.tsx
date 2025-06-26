
import React from "react";
import { Calendar } from "lucide-react";

interface PeriodInfoProps {
  checkIn?: string | null;
  checkOut?: string | null;
}

const PeriodInfo: React.FC<PeriodInfoProps> = ({ checkIn, checkOut }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('it-IT');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 rounded">
      <Calendar className="h-4 w-4" />
      <span>
        {checkIn ? formatDate(checkIn) : 'N/A'} - {checkOut ? formatDate(checkOut) : 'N/A'}
      </span>
    </div>
  );
};

export default PeriodInfo;

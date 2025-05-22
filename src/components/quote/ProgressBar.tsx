
import React from "react";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      <div className="bg-muted h-2 rounded-full">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Ospiti</span>
        <span>Date</span>
        <span>Appartamento</span>
        <span>Extra</span>
        <span>Riepilogo</span>
      </div>
    </div>
  );
};

export default ProgressBar;

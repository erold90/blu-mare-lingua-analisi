
import React from "react";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      <div className="bg-secondary h-3 rounded-full shadow-inner">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-3 text-sm">
        <span className={`${step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'} transition-colors`}>Ospiti</span>
        <span className={`${step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'} transition-colors`}>Date</span>
        <span className={`${step >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'} transition-colors`}>Appartamento</span>
        <span className={`${step >= 4 ? 'text-primary font-medium' : 'text-muted-foreground'} transition-colors`}>Extra</span>
        <span className={`${step >= 5 ? 'text-primary font-medium' : 'text-muted-foreground'} transition-colors`}>Riepilogo</span>
      </div>
    </div>
  );
};

export default ProgressBar;

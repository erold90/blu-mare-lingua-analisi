
import React from "react";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      <div className="relative">
        <div className="bg-border h-px w-full">
          <div
            className="bg-foreground h-px transition-all duration-700 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <div 
          className="absolute top-0 w-2 h-2 bg-foreground rounded-full transform -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ left: `${(step / totalSteps) * 100}%`, marginLeft: '-4px' }}
        />
      </div>
      <div className="flex justify-between mt-6 text-xs uppercase tracking-wider">
        <span className={`${step >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'} transition-colors`}>Ospiti</span>
        <span className={`${step >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'} transition-colors`}>Date</span>
        <span className={`${step >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'} transition-colors`}>Appartamento</span>
        <span className={`${step >= 4 ? 'text-foreground font-medium' : 'text-muted-foreground'} transition-colors`}>Servizi</span>
        <span className={`${step >= 5 ? 'text-foreground font-medium' : 'text-muted-foreground'} transition-colors`}>Riepilogo</span>
      </div>
    </div>
  );
};

export default ProgressBar;

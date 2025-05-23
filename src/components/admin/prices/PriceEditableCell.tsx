
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3 } from 'lucide-react';

interface PriceEditableCellProps {
  apartmentId: string;
  weekStart: string;
  price: number;
  priceLevel: {
    level: string;
    color: string;
    label: string;
  };
  isEditing: boolean;
  onEdit: () => void;
  onSave: (price: number) => void;
  onCancel: () => void;
}

const PriceEditableCell: React.FC<PriceEditableCellProps> = ({
  apartmentId,
  weekStart,
  price,
  priceLevel,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  const [editValue, setEditValue] = useState(price.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(price.toString());
  }, [price]);

  const handleSave = () => {
    const newPrice = parseInt(editValue);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onSave(newPrice);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-[120px]">
        <Input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm text-center w-20"
          min="0"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-md px-2 py-1.5 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all group ${priceLevel.color}/10 border border-transparent hover:border-blue-300`}
      onClick={onEdit}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-sm">€{price}</span>
        <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
      
      {/* Indicatore livello prezzo */}
      <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${priceLevel.color} transform translate-x-1 -translate-y-1`} />
    </div>
  );
};

export default PriceEditableCell;

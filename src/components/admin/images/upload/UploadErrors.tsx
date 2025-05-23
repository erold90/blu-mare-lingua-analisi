
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface UploadErrorsProps {
  errors: string[];
}

export const UploadErrors: React.FC<UploadErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-2">Errori di caricamento:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

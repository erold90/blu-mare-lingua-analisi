
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointer } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface AnalyticsBehaviorProps {
  interactions: any[];
}

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

export const AnalyticsBehavior = ({ interactions }: AnalyticsBehaviorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interazioni Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {interactions?.slice(0, 20).map((interaction) => (
            <div key={interaction.id} className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                <div>
                  <span className="text-sm font-medium">{toString(interaction.interaction_type) || 'Unknown'}</span>
                  {interaction.element_text && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {toString(interaction.element_text)}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(interaction.timestamp), 'HH:mm dd/MM', { locale: it })}
              </span>
            </div>
          )) || []}
        </div>
      </CardContent>
    </Card>
  );
};

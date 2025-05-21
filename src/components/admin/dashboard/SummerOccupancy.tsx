
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SummerOccupancyProps {
  summerOccupancy: Array<{ name: string; occupancy: number }>;
}

export const SummerOccupancy: React.FC<SummerOccupancyProps> = ({ summerOccupancy }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupazione Estiva</CardTitle>
        <CardDescription>Percentuale di occupazione da giugno a settembre</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summerOccupancy.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.occupancy}%</div>
              </div>
              <Progress value={item.occupancy} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

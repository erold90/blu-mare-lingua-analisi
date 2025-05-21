
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ChartContainer,
  ChartTooltip
} from "@/components/ui/chart";

interface CleaningStatsProps {
  cleaningStats: {
    data: Array<{ name: string; value: number }>;
    completionRate: number;
  };
}

// Memoize component to prevent unnecessary re-renders
export const CleaningStats: React.FC<CleaningStatsProps> = React.memo(({ cleaningStats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stato Pulizie</CardTitle>
        <CardDescription>Panoramica delle attività di pulizia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="h-[150px] w-[150px]">
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={cleaningStats.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                  >
                    <Cell fill="#10b981" name="Completate" />
                    <Cell fill="#f59e0b" name="In corso" />
                    <Cell fill="#6b7280" name="Da fare" />
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Numero: <span className="font-semibold text-foreground">{data.value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold">{cleaningStats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Completate</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          {cleaningStats.data.map((item, index) => (
            <div key={index} className="p-2">
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

CleaningStats.displayName = "CleaningStats";

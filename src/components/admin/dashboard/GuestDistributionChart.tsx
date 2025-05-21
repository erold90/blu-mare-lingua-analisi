
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ChartContainer,
  ChartTooltip
} from "@/components/ui/chart";

// Colori per i grafici
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

interface GuestDistributionChartProps {
  guestDistribution: Array<{ name: string; value: number }>;
}

// Memoize component to prevent unnecessary re-renders
export const GuestDistributionChart: React.FC<GuestDistributionChartProps> = React.memo(({ guestDistribution }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ospiti</CardTitle>
        <CardDescription>Tipologie di ospiti</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={{}}>
            <PieChart>
              <Pie
                data={guestDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {guestDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
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
      </CardContent>
    </Card>
  );
});

GuestDistributionChart.displayName = "GuestDistributionChart";

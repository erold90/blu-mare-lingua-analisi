
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ChartContainer, 
  ChartTooltip
} from "@/components/ui/chart";

interface SummerRevenueChartProps {
  summerMonthlyRevenue: Array<{ name: string; revenue: number }>;
}

// Memoize component to prevent unnecessary re-renders
export const SummerRevenueChart: React.FC<SummerRevenueChartProps> = React.memo(({ summerMonthlyRevenue }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Guadagno Mensile Estivo</CardTitle>
        <CardDescription>Distribuzione delle entrate da giugno a settembre</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <div className="h-[300px] w-full mt-4">
          <ChartContainer 
            config={{
              revenue: { theme: { light: "#34d399", dark: "#34d399" } },
            }}
          >
            <BarChart 
              data={summerMonthlyRevenue} 
              margin={{ left: 30, right: 15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const month = data.payload.name;
                    const revenue = data.payload.revenue;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="font-medium">{month}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Guadagno: <span className="font-semibold text-foreground">€{revenue.toLocaleString()}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" name="Guadagno" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
});

SummerRevenueChart.displayName = "SummerRevenueChart";

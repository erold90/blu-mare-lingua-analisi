
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ChartContainer
} from "@/components/ui/chart";

interface MonthlyReservationsChartProps {
  reservationsByMonth: Array<{ name: string; count: number }>;
}

// Memoize component to prevent unnecessary re-renders
export const MonthlyReservationsChart: React.FC<MonthlyReservationsChartProps> = React.memo(({ reservationsByMonth }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Prenotazioni per Mese</CardTitle>
        <CardDescription>Distribuzione annuale delle prenotazioni</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <div className="h-[300px] w-full mt-4">
          <ChartContainer 
            config={{
              count: { theme: { light: "#8b5cf6", dark: "#8b5cf6" } },
            }}
          >
            <LineChart 
              data={reservationsByMonth} 
              margin={{ left: 30, right: 15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Prenotazioni: <span className="font-semibold text-foreground">
                            {payload[0].value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Prenotazioni" 
                stroke="var(--color-count)" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
});

MonthlyReservationsChart.displayName = "MonthlyReservationsChart";

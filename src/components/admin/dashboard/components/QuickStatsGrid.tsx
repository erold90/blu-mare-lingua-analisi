
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  Euro, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Minus
} from "lucide-react";

interface QuickStatsGridProps {
  data: any;
}

const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ data }) => {
  const {
    futureReservations,
    pendingCleanings,
    totalGuests,
    totalRevenue,
    cleaningStats
  } = data;

  const completionRate = cleaningStats?.completionRate || 0;
  
  const StatCard = ({ title, value, icon: Icon, color, badge, trend, progress }: any) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            {title}
          </span>
          {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-2">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          {trend !== undefined && (
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
              trend > 0 ? 'text-green-600 bg-green-50' : 
              trend < 0 ? 'text-red-600 bg-red-50' : 
              'text-gray-600 bg-gray-50'
            }`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : 
               trend < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : 
               <Minus className="h-3 w-3 mr-1" />}
              {trend !== 0 ? `${Math.abs(trend)}%` : 'Stabile'}
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">{progress}% completamento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Prenotazioni Future"
        value={futureReservations}
        icon={Calendar}
        color="text-blue-600"
        badge="Attive"
        trend={5}
      />
      
      <StatCard
        title="Ospiti Totali"
        value={totalGuests.toLocaleString()}
        icon={Users}
        color="text-green-600"
        badge="Anno"
        trend={12}
      />
      
      <StatCard
        title="Revenue Totale"
        value={`€${totalRevenue.toLocaleString()}`}
        icon={Euro}
        color="text-purple-600"
        badge="Anno"
        trend={8}
      />
      
      <StatCard
        title="Pulizie"
        value={`${pendingCleanings} da fare`}
        icon={Sparkles}
        color={pendingCleanings > 0 ? "text-orange-600" : "text-green-600"}
        badge="Oggi"
        progress={completionRate}
      />
    </div>
  );
};

export default QuickStatsGrid;

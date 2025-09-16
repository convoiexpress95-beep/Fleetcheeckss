import { Clock, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { mockMissions } from "@/lib/mock-data";

const MissionKPIs = () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const activeMissions = mockMissions.filter(m => 
    m.status === "pending" || m.status === "in-progress"
  ).length;

  const overdueMissions = mockMissions.filter(m => 
    m.status === "in-progress" && new Date(m.schedule.date) < now
  ).length;

  const todayDeliveries = mockMissions.filter(m => {
    const missionDate = new Date(m.schedule.date);
    return missionDate >= todayStart && missionDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  }).length;

  const weeklyDeliveryRate = mockMissions.filter(m => 
    m.status === "delivered" && new Date(m.updatedAt) >= weekAgo
  ).length / mockMissions.filter(m => new Date(m.createdAt) >= weekAgo).length * 100 || 0;

  const kpis = [
    {
      title: "Missions actives",
      value: activeMissions,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/20"
    },
    {
      title: "En retard",
      value: overdueMissions,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/20"
    },
    {
      title: "À livrer aujourd'hui",
      value: todayDeliveries,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Taux livraison 7j",
      value: `${Math.round(weeklyDeliveryRate)}%`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MissionKPIs;
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "primary" | "accent" | "success" | "warning";
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = "primary" 
}: StatsCardProps) => {
  const colorClasses = {
    primary: "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary",
    accent: "bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 text-accent",
    success: "bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/5 text-green-500",
    warning: "bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-yellow-500/5 text-yellow-500"
  };

  return (
    <div className="bg-card rounded-2xl shadow-elegant border border-border p-6 hover:shadow-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="text-right">
            <div className={`text-sm font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </div>
            <div className="text-xs text-muted-foreground">{trend.label}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default StatsCard;
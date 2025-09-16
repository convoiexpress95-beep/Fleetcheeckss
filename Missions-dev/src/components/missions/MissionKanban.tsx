import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, User, Euro, AlertCircle } from "lucide-react";
import { Mission, MissionStatus } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/mock-data";

interface MissionKanbanProps {
  missions: Mission[];
}

const MissionKanban = ({ missions }: MissionKanbanProps) => {
  const statuses: MissionStatus[] = ["pending", "in-progress", "delivered", "cancelled"];
  
  const getMissionsByStatus = (status: MissionStatus) => {
    return missions.filter(mission => mission.status === status);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const getColumnColor = (status: MissionStatus) => {
    switch (status) {
      case "pending": return "border-t-blue-500";
      case "in-progress": return "border-t-primary";
      case "delivered": return "border-t-green-500";
      case "cancelled": return "border-t-gray-500";
      default: return "border-t-gray-500";
    }
  };

  const isOverdue = (mission: Mission) => {
    return mission.status === "in-progress" && new Date(mission.schedule.date) < new Date();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {statuses.map((status) => {
        const statusMissions = getMissionsByStatus(status);
        
        return (
          <div key={status} className="space-y-4">
            {/* Column Header */}
            <div className={`glass rounded-xl p-4 border-t-4 ${getColumnColor(status)}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {getStatusLabel(status)}
                </h3>
                <Badge variant="secondary" className="bg-secondary/50">
                  {statusMissions.length}
                </Badge>
              </div>
            </div>

            {/* Mission Cards */}
            <div className="space-y-3 min-h-[200px]">
              {statusMissions.map((mission) => (
                <Card 
                  key={mission.id} 
                  className={`glass border-glass-border hover:bg-secondary/30 transition-all cursor-pointer group ${
                    isOverdue(mission) ? 'ring-2 ring-destructive/50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {mission.client.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          #{mission.id} • {mission.vehicle.brand} {mission.vehicle.model}
                        </p>
                      </div>
                      {isOverdue(mission) && (
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Itinerary */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-foreground truncate">
                          {mission.itinerary.departure.address.split(',')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs ml-5">
                        <span className="text-primary">↓ {mission.itinerary.distance}km</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3 w-3 text-green-400 flex-shrink-0" />
                        <span className="text-foreground truncate">
                          {mission.itinerary.arrival.address.split(',')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDate(mission.schedule.date)} • {mission.schedule.timeSlot}
                      </span>
                    </div>

                    {/* Assigned To & Cost */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {mission.assignedTo ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                {mission.assignedTo.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {mission.assignedTo.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Non assigné</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">
                          {mission.cost.total}€
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Urgent */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(mission.status)} text-xs px-2 py-0.5 border-0`}>
                        {getStatusLabel(mission.status)}
                      </Badge>
                      
                      {mission.schedule.urgent && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          URGENT
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {statusMissions.length === 0 && (
                <div className="glass-subtle rounded-lg p-6 text-center border-2 border-dashed border-glass-border">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Aucune mission {getStatusLabel(status).toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MissionKanban;
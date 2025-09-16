import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, MapPin, Eye, Edit, FileText, X, Archive } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mission } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/mock-data";

interface MissionTableProps {
  missions: Mission[];
}

const MissionTable = ({ missions }: MissionTableProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (missions.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune mission trouvée</h3>
        <p className="text-muted-foreground mb-4">
          Ajustez vos filtres ou créez une nouvelle mission pour commencer.
        </p>
        <Button>
          <MapPin className="h-4 w-4 mr-2" />
          Créer une mission
        </Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-glass-border hover:bg-secondary/50">
            <TableHead className="w-16">#</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Itinéraire</TableHead>
            <TableHead>Date & Créneau</TableHead>
            <TableHead>Assigné à</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Coût</TableHead>
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission.id} className="border-glass-border hover:bg-secondary/30 transition-colors">
              <TableCell className="font-mono text-sm text-muted-foreground">
                #{mission.id}
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{mission.client.name}</div>
                  <div className="text-sm text-muted-foreground">{mission.client.contact.name}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">
                    {mission.vehicle.brand} {mission.vehicle.model}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mission.vehicle.registration} • {mission.vehicle.category}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <div className="font-medium text-foreground truncate max-w-32">
                      {mission.itinerary.departure.address.split(',')[0]}
                    </div>
                    <div className="text-primary text-xs">↓ {mission.itinerary.distance}km</div>
                    <div className="font-medium text-foreground truncate max-w-32">
                      {mission.itinerary.arrival.address.split(',')[0]}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{formatDate(mission.schedule.date)}</div>
                  <div className="text-sm text-muted-foreground">{mission.schedule.timeSlot}</div>
                  {mission.schedule.urgent && (
                    <Badge variant="destructive" className="mt-1 text-xs">URGENT</Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {mission.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {mission.assignedTo.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{mission.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Non assigné</span>
                )}
              </TableCell>
              
              <TableCell>
                <Badge className={`${getStatusColor(mission.status)} border-0`}>
                  {getStatusLabel(mission.status)}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-right">
                  <div className="font-medium text-foreground">{mission.cost.total}€</div>
                  <div className="text-xs text-muted-foreground">
                    {mission.cost.credits} crédit{mission.cost.credits > 1 ? 's' : ''}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-glass-border">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Éditer
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer PDF
                    </DropdownMenuItem>
                    {mission.status !== "cancelled" && (
                      <DropdownMenuItem className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MissionTable;
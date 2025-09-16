import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mission, MissionStatus } from '@/lib/mission-types';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ALLOW_STATUS_CHANGE } from '@/lib/mission-policy';
import { MoreHorizontal } from 'lucide-react';
import { getMissionStatusStyle } from '@/lib/mission-status-colors';

interface Props { missions: Mission[]; onStatusChange?: (id:string, s:MissionStatus)=>void; onExportCsv?: ()=>void; onRemove?: (id:string)=>void; sortField?: string; sortDir?: string; onToggleSort?: (field:string)=>void }
const ALL_STATUSES: MissionStatus[] = ['En attente','En cours','En retard','Livrée','Annulée'];
export const MissionTable: React.FC<Props> = ({ missions, onStatusChange, onExportCsv, onRemove, sortField, sortDir, onToggleSort }) => {
  const navigate = useNavigate();
  return (
    <div className="glass-card rounded-xl overflow-hidden relative group">
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {missions.length} éléments
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onExportCsv} className="btn-turquoise h-7 text-xs gap-1 group">
            <span className="icon-float">⇩</span>
            Export CSV
          </Button>
        </div>
      </div>
      <div className="relative overflow-auto max-h-[70vh] custom-scrollbar">
      <Table aria-label="Table des missions" role="table" className="text-sm">
        <caption className="sr-only">Liste des missions filtrées</caption>
        <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl">
          <TableRow className="hover:bg-transparent">
            <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={()=>onToggleSort && onToggleSort('createdAt')} aria-sort={sortField==='createdAt'? (sortDir==='asc'?'ascending':'descending'):'none'}>#</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Départ → Arrivée</TableHead>
            <TableHead>Créneau</TableHead>
            <TableHead>Assigné</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={()=>onToggleSort && onToggleSort('status')} aria-sort={sortField==='status'? (sortDir==='asc'?'ascending':'descending'):'none'}>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map(m=> (
            <TableRow key={m.id} className="mission-table-row transition-colors hover:bg-white/5 hover:backdrop-blur-sm">
              <TableCell className="font-mono text-[10px] text-muted-foreground/70 align-top pt-3">{m.id}</TableCell>
              <TableCell className="pt-3">
                <div className="font-medium text-sm leading-tight">{m.client.name}</div>
                <div className="text-[11px] text-muted-foreground/60">{m.departure.address.city}</div>
              </TableCell>
              <TableCell>{m.vehicle.brand} {m.vehicle.model}</TableCell>
              <TableCell className="text-xs">{m.departure.address.city} → {m.arrival.address.city}</TableCell>
              <TableCell className="text-xs">{new Date(m.departure.date).toLocaleDateString('fr-FR')}<br/>{m.departure.timeSlot}</TableCell>
              <TableCell className="text-xs">{m.assignedTo?.name || '-'}</TableCell>
              <TableCell>
                {ALLOW_STATUS_CHANGE ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="px-2 focus-premium" aria-label={`Changer statut mission ${m.id}`}>
                        {(() => { const s = getMissionStatusStyle(m.status); return (
                          <Badge variant="outline" className={`cursor-pointer px-2 py-1 text-[11px] font-medium ${s.badge}`}>{m.status}</Badge>
                        ); })()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {ALL_STATUSES.map(s => (
                        <DropdownMenuItem key={s} disabled={s===m.status} onClick={()=>onStatusChange && onStatusChange(m.id, s)}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  (() => { const s = getMissionStatusStyle(m.status); return (
                    <div className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium select-none cursor-not-allowed opacity-80 ${s.badge}`} aria-label={`Statut verrouillé ${m.status}`}>{m.status}</div>
                  ); })()
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="px-2 focus-premium" aria-label={`Actions mission ${m.id}`}><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={()=>navigate(`/missions/${m.id}`)}>Ouvrir</DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>onRemove && onRemove(m.id)}>Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {missions.length===0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-10">Aucune mission</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

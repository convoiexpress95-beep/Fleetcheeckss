import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { statusMappings } from '@/lib/mappings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MissionDetailsDialogProps {
  mission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MissionDetailsDialog = ({ mission, open, onOpenChange }: MissionDetailsDialogProps) => {
  if (!mission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {mission.title}
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Référence: {mission.reference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant={mission.status === 'completed' ? 'default' : 'secondary'}>
              {statusMappings.mission[mission.status] || mission.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Créé le {format(new Date(mission.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </span>
          </div>

          {mission.description && (
            <div>
              <h4 className="font-semibold text-white mb-2">Description</h4>
              <p className="text-foreground">{mission.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Informations véhicule</h4>
              <div className="space-y-2 text-sm">
                {mission.vehicle_type && <p><span className="text-muted-foreground">Type:</span> {mission.vehicle_type}</p>}
                {mission.vehicle_brand && <p><span className="text-muted-foreground">Marque:</span> {mission.vehicle_brand}</p>}
                {mission.vehicle_model && <p><span className="text-muted-foreground">Modèle:</span> {mission.vehicle_model}</p>}
                {mission.vehicle_year && <p><span className="text-muted-foreground">Année:</span> {mission.vehicle_year}</p>}
                {mission.license_plate && <p><span className="text-muted-foreground">Immatriculation:</span> {mission.license_plate}</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Participants</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Créateur:</span> {mission.creator_profile?.full_name || 'Non défini'}</p>
                <p><span className="text-muted-foreground">Donneur d'ordre:</span> {mission.donor_profile?.full_name || 'Non assigné'}</p>
                <p><span className="text-muted-foreground">Convoyeur:</span> {mission.driver_profile?.full_name || 'Non assigné'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Départ</h4>
              <div className="space-y-2 text-sm">
                {mission.pickup_address && <p className="text-foreground">{mission.pickup_address}</p>}
                {mission.pickup_contact_name && <p><span className="text-muted-foreground">Contact:</span> {mission.pickup_contact_name}</p>}
                {mission.pickup_contact_phone && <p><span className="text-muted-foreground">Téléphone:</span> {mission.pickup_contact_phone}</p>}
                {mission.pickup_date && <p><span className="text-muted-foreground">Date:</span> {format(new Date(mission.pickup_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Arrivée</h4>
              <div className="space-y-2 text-sm">
                {mission.delivery_address && <p className="text-foreground">{mission.delivery_address}</p>}
                {mission.delivery_contact_name && <p><span className="text-muted-foreground">Contact:</span> {mission.delivery_contact_name}</p>}
                {mission.delivery_contact_phone && <p><span className="text-muted-foreground">Téléphone:</span> {mission.delivery_contact_phone}</p>}
                {mission.delivery_date && <p><span className="text-muted-foreground">Date:</span> {format(new Date(mission.delivery_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
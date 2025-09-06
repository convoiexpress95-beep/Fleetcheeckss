import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateMission } from '@/hooks/useMissions';

interface ChangePriceDialogProps {
  mission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePriceDialog = ({ mission, open, onOpenChange }: ChangePriceDialogProps) => {
  const [donorEarning, setDonorEarning] = useState(mission?.donor_earning || '');
  const [driverEarning, setDriverEarning] = useState(mission?.driver_earning || '');
  const updateMission = useUpdateMission();

  const handleUpdatePrice = async () => {
    if (!mission?.id) return;

    try {
      await updateMission.mutateAsync({
        id: mission.id,
        updates: {
          donor_earning: parseFloat(donorEarning) || 0,
          driver_earning: parseFloat(driverEarning) || 0
        }
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Modifier les tarifs
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Ajustez les revenus pour la mission: {mission?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="donorEarning" className="text-white">
              Revenus donneur d'ordre (€)
            </Label>
            <Input
              id="donorEarning"
              type="number"
              step="0.01"
              value={donorEarning}
              onChange={(e) => setDonorEarning(e.target.value)}
              className="glass-input border-white/20 text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="driverEarning" className="text-white">
              Revenus convoyeur (€)
            </Label>
            <Input
              id="driverEarning"
              type="number"
              step="0.01"
              value={driverEarning}
              onChange={(e) => setDriverEarning(e.target.value)}
              className="glass-input border-white/20 text-white"
              placeholder="0.00"
            />
          </div>

          {(donorEarning || driverEarning) && (
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-foreground/80">
                Total: {((parseFloat(donorEarning) || 0) + (parseFloat(driverEarning) || 0)).toFixed(2)} €
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="glass-card text-foreground border-border hover:bg-muted/50"
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdatePrice}
            disabled={updateMission.isPending}
            className="bg-gradient-cosmic hover:scale-105 transition-all duration-300"
          >
            {updateMission.isPending ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
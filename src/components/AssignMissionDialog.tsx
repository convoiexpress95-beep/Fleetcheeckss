import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyContacts } from '@/hooks/useContacts';
import { useAssignMission } from '@/hooks/useMissions';

interface AssignMissionDialogProps {
  mission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignMissionDialog = ({ mission, open, onOpenChange }: AssignMissionDialogProps) => {
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const { data: contactsData } = useMyContacts();
  const assignMission = useAssignMission();

  const handleAssign = async () => {
    if (!selectedDriver || !mission?.id) return;

    try {
      await assignMission.mutateAsync({
        id: mission.id,
        driverId: selectedDriver
      });
      onOpenChange(false);
      setSelectedDriver('');
    } catch (error) {
      console.error('Error assigning mission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Assigner la mission
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Choisissez un convoyeur pour cette mission: {mission?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Convoyeur
            </label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="glass-input border-white/20">
                <SelectValue placeholder="Sélectionner un convoyeur" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                {contactsData?.data?.map((contact: any) => (
                  <SelectItem key={contact.invited_user_id} value={contact.invited_user_id}>
                    {contact.name} ({contact.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            onClick={handleAssign}
            disabled={!selectedDriver || assignMission.isPending}
            className="bg-gradient-cosmic hover:scale-105 transition-all duration-300"
          >
            {assignMission.isPending ? 'Attribution...' : 'Assigner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
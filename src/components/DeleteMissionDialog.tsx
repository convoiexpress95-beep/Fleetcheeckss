import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteMission } from '@/hooks/useMissions';

interface DeleteMissionDialogProps {
  mission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteMissionDialog = ({ mission, open, onOpenChange }: DeleteMissionDialogProps) => {
  const deleteMission = useDeleteMission();

  const handleDelete = async () => {
    if (!mission?.id) return;

    try {
      await deleteMission.mutateAsync(mission.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-white/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Supprimer la mission
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            Êtes-vous sûr de vouloir supprimer définitivement la mission "{mission?.title}" ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="glass-card text-foreground border-border hover:bg-muted/50">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMission.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMission.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
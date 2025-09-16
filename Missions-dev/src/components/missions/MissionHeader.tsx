import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissionHeaderProps {
  onCreateMission: () => void;
}

const MissionHeader = ({ onCreateMission }: MissionHeaderProps) => {
  return (
    <div className="glass rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Missions</h1>
            <p className="text-muted-foreground">
              Gérez vos missions de convoyage en temps réel
            </p>
          </div>
        </div>
        
        <Button onClick={onCreateMission} className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Créer une mission
        </Button>
      </div>
    </div>
  );
};

export default MissionHeader;
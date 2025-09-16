import { Button } from '@/components/ui/button';
import { Plus, KanbanSquare, List } from 'lucide-react';
import { ViewMode } from '@/hooks/useMissionStore';
// Animation légère fallback si framer-motion non présent
let MotionWrapper: React.FC<{children: any}> = ({ children }) => <>{children}</>;
try {
  // @ts-ignore
  const fm = require('framer-motion');
  if (fm?.motion) {
    MotionWrapper = (props:any) => <fm.motion.div whileTap={{ scale: 0.95 }}>{props.children}</fm.motion.div>;
  }
} catch {}

interface Props {
  count: number;
  viewMode: ViewMode;
  onToggleView: () => void;
  onCreate: () => void;
  compact: boolean;
  onToggleCompact: () => void;
}

const MissionHeader: React.FC<Props> = ({ count, viewMode, onToggleView, onCreate, compact, onToggleCompact }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-teal-200 text-transparent bg-clip-text">Missions</h1>
        <p className="text-sm text-muted-foreground">{count} missions filtrées</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onToggleView} className="gap-2 group">
          {viewMode === 'list' ? <KanbanSquare className="w-4 h-4 icon-float" /> : <List className="w-4 h-4 icon-float" />}
          {viewMode === 'list' ? 'Kanban' : 'Liste'}
        </Button>
        <Button variant="ghost" onClick={onToggleCompact} className="text-xs px-2 border border-white/10 hover:border-white/30">
          {compact ? 'Densité normale' : 'Densité compacte'}
        </Button>
        <MotionWrapper>
          <Button onClick={onCreate} className="btn-turquoise gap-2 group">
            <Plus className="w-4 h-4 icon-pulse" />
            Créer une mission
          </Button>
        </MotionWrapper>
      </div>
    </div>
  );
};
export default MissionHeader;

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getVehicleImageUrl } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (imagePath: string) => void;
  prefix?: string; // dossier dans le bucket, ex: 'catalog' ou 'models/peugeot'
};

type FileItem = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  metadata?: any;
};

export const VehicleImagePicker: React.FC<Props> = ({ open, onClose, onSelect, prefix = 'catalog' }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState(prefix);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!open) return;
      setLoading(true);
      try {
        // Liste non récursive sous le préfixe fourni
        const base = sanitize(folder || 'catalog');
        const { data, error } = await supabase.storage.from('vehicle-assets').list(base, { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        if (error) throw error;
        if (mounted) setFiles((data || []).filter((f: any) => !f.name.endsWith('/') && !f.id?.endsWith('/')) as FileItem[]);
      } catch (e) {
        console.error('Storage list error', e);
        if (mounted) setFiles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [open, folder]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return files;
    return files.filter(f => f.name.toLowerCase().includes(term));
  }, [files, q]);

  function sanitize(s: string) {
    return (s || 'catalog')
      .replace(/\\/g, '/')
      .split('/')
      .map((p) => p.trim().replace(/\s+/g, '_').toLowerCase())
      .filter(Boolean)
      .join('/');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[95vw] max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 bg-background shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="font-semibold">Choisir une image véhicule</div>
          <div className="ml-auto flex items-center gap-2">
            <Input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Sous-dossier (ex: catalog/volkswagen)" className="w-64" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer (marque, modèle, catégorie)" className="w-64" />
            <Button variant="ghost" onClick={onClose}>Fermer</Button>
          </div>
        </div>
        <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
          {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Aucune image trouvée dans {sanitize(folder)}. Téléversez vos 85 images dans le bucket 'vehicle-assets/{sanitize(folder)}'.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((f) => {
              const base = sanitize(folder || 'catalog');
              const imagePath = `${base}/${f.name}`;
              const src = getVehicleImageUrl({ image_path: imagePath });
              return (
                <button
                  key={imagePath}
                  type="button"
                  onClick={() => { onSelect(imagePath); onClose(); }}
                  className="group border border-white/10 rounded-lg overflow-hidden hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  title={f.name}
                >
                  <img src={src} alt={f.name} className="w-full h-28 object-contain bg-muted" />
                  <div className="p-2 text-xs text-foreground/80 truncate group-hover:text-primary">{f.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleImagePicker;

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks';
import VehicleImage from '@/components/VehicleImage';

const BODY_TYPES = ['suv','berline','utilitaire','hatchback','break','monospace','pickup','camion','moto','autre'];

type VehicleModel = {
  id: string;
  make: string;
  model: string;
  body_type: string;
  generation: string | null;
  image_path: string | null;
};

export const VehicleModelsManager: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ make: '', model: '', body_type: 'berline', generation: '', image_path: '' });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vehicle_models').select('*').order('make').order('model');
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setItems(data as any);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => `${i.make} ${i.model} ${i.generation || ''}`.toLowerCase().includes(q));
  }, [items, filter]);

  const addModel = async () => {
    try {
      if (!form.make || !form.model) {
        toast({ title: 'Champs requis', description: 'Marque et modèle sont obligatoires', variant: 'destructive' });
        return;
      }
      const payload = {
        make: form.make.trim(),
        model: form.model.trim(),
        body_type: form.body_type,
        generation: form.generation?.trim() || null,
        image_path: form.image_path?.trim() || null,
      };
      const { error } = await supabase.from('vehicle_models').insert(payload);
      if (error) throw error;
      setForm({ make: '', model: '', body_type: 'berline', generation: '', image_path: '' });
      toast({ title: 'Modèle ajouté', description: 'Le modèle a été enregistré.' });
      load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from('vehicle_models').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Modèle supprimé' });
      load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un modèle</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="space-y-1">
            <Label>Marque</Label>
            <Input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="Peugeot" />
          </div>
          <div className="space-y-1">
            <Label>Modèle</Label>
            <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="208" />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={form.body_type} onValueChange={v => setForm({ ...form, body_type: v })}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {BODY_TYPES.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Génération (optionnel)</Label>
            <Input value={form.generation} onChange={e => setForm({ ...form, generation: e.target.value })} placeholder="II (2019-)" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Chemin image (bucket vehicle-assets)</Label>
            <Input value={form.image_path} onChange={e => setForm({ ...form, image_path: e.target.value })} placeholder="models/peugeot/208.webp" />
          </div>
          <div className="md:col-span-6 flex items-center gap-3">
            <Button onClick={addModel} className="bg-gradient-royal">Ajouter</Button>
            <div className="flex-1"></div>
            <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrer…" className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="text-muted-foreground">Chargement…</div>}
        {!loading && filtered.map(vm => (
          <Card key={vm.id} className="hover:border-primary/40 transition-colors">
            <CardContent className="p-4 space-y-3">
              <VehicleImage imagePath={vm.image_path || undefined} bodyType={vm.body_type} alt={`${vm.make} ${vm.model}`} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{vm.make} {vm.model}</div>
                  <div className="text-xs text-muted-foreground">{vm.body_type}{vm.generation ? ` • ${vm.generation}` : ''}</div>
                  {vm.image_path && <div className="text-xs text-muted-foreground break-all">{vm.image_path}</div>}
                </div>
                <Button variant="destructive" onClick={() => remove(vm.id)} size="sm">Supprimer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <Card><CardContent className="p-6 text-center text-muted-foreground">Aucun modèle</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default VehicleModelsManager;

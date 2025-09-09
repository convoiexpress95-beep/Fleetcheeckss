import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { findVehicleByName, getAllBrands, getVehiclesByBrand, getVehiclesSortedByBrand } from '@/data/fleetmarketVehicles';
// Pas de connexion directe supabase ici – usage service mock
import { publishMission } from '@/services/fleetMarketService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Car, MapPin, Calendar, Euro, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props { onCreated?: () => void; }

export function PublishMissionDialog({ onCreated }: Props){
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [brand, setBrand] = useState('all');
  const [form, setForm] = useState({
    departure:'', arrival:'', departureDate:'', vehicle:'', price:'', description:''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user){ return toast({ title:'Auth requise', description:'Connectez-vous', variant:'destructive'}); }
    if(!form.departure || !form.arrival || !form.vehicle || !form.price){
      return toast({ title:'Champs manquants', description:'Complétez les champs obligatoires', variant:'destructive'});
    }
    setSubmitting(true);
    try {
      await publishMission({
        titre: `Transport ${form.vehicle} - ${form.departure} vers ${form.arrival}`,
        ville_depart: form.departure,
        ville_arrivee: form.arrival,
        date_depart: form.departureDate ? new Date(form.departureDate).toISOString(): new Date().toISOString(),
        vehicule_requis: form.vehicle,
        prix_propose: parseFloat(form.price),
        description: form.description || null
      } as any);
      toast({ title:'Mission publiée', description:'Enregistrée (Supabase ou fallback)' });
      setIsOpen(false);
      setForm({ departure:'', arrival:'', departureDate:'', vehicle:'', price:'', description:'' });
      onCreated?.();
    } catch(e:any){
      console.error(e);
      toast({ title:'Erreur', description:"Échec de la publication", variant:'destructive'});
    }
    setSubmitting(false);
  };

  const selectedVehicle = form.vehicle ? findVehicleByName(form.vehicle) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='bg-primary text-primary-foreground'><Plus className='w-4 h-4 mr-1' /> Mission</Button>
      </DialogTrigger>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'><Car className='w-5 h-5 text-primary'/> Publier une mission</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className='space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Départ *</Label>
              <Input value={form.departure} onChange={e=>setForm(f=>({...f, departure:e.target.value}))} required />
            </div>
            <div>
              <Label>Arrivée *</Label>
              <Input value={form.arrival} onChange={e=>setForm(f=>({...f, arrival:e.target.value}))} required />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Date de départ</Label>
              <Input type='datetime-local' value={form.departureDate} onChange={e=>setForm(f=>({...f, departureDate:e.target.value}))} />
            </div>
            <div>
              <Label>Prix proposé (€) *</Label>
              <Input type='number' value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} required />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Marque</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toutes</SelectItem>
                  {getAllBrands().map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Véhicule *</Label>
              <Select value={form.vehicle} onValueChange={v=>setForm(f=>({...f, vehicle:v}))}>
                <SelectTrigger><SelectValue placeholder='Choisir' /></SelectTrigger>
                <SelectContent className='max-h-64'>
                  {(brand==='all'? getVehiclesSortedByBrand(): getVehiclesByBrand(brand)).map(v => (
                    <SelectItem key={v.id} value={v.name}>{v.brand} - {v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedVehicle && (
            <div className='flex items-center gap-3 p-3 rounded-md border'>
              <img src={selectedVehicle.image} className='w-20 h-14 object-cover rounded' />
              <div>
                <p className='font-medium'>{selectedVehicle.name}</p>
                <p className='text-xs text-muted-foreground'>{selectedVehicle.brand}</p>
              </div>
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} rows={4} />
          </div>
          <div className='flex gap-2 pt-2'>
            <Button type='button' variant='outline' className='flex-1' onClick={()=>setIsOpen(false)}>Annuler</Button>
            <Button type='submit' disabled={isSubmitting} className='flex-1'>
              {isSubmitting ? (<><Loader2 className='w-4 h-4 mr-2 animate-spin'/>Publication...</>) : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

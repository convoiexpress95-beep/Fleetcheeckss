import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VehicleImagePicker from '@/components/VehicleImagePicker';
import { getVehicleImageUrl } from '@/lib/utils';
import MapboxAddressInput from '@/components/MapboxAddressInput';

const MIN_PRICE = 50;

const PostMarketplaceMission: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [license, setLicense] = useState('');
  const [pickup, setPickup] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupPostal, setPickupPostal] = useState('');
  const [drop, setDrop] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [dropPostal, setDropPostal] = useState('');
  const [vehicleGroup, setVehicleGroup] = useState<'leger'|'utilitaire'|'poids_lourd'|'none'>('none');
  const [price, setPrice] = useState('');
  const [req, setReq] = useState({
    assurance: false,
    wgarage: false,
    plateau: false,
    porte10: false,
    convoyeur: false,
  });
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const valid = useMemo(() => {
    return title.trim() && vehicleName.trim() && license.trim() && pickup.trim() && drop.trim() && pickupCity.trim() && dropCity.trim() && pickupPostal.trim() && dropPostal.trim() && vehicleGroup !== 'none' && Number(price) >= MIN_PRICE && !!imagePath;
  }, [title, vehicleName, license, pickup, drop, pickupCity, dropCity, pickupPostal, dropPostal, vehicleGroup, price, imagePath]);

  const submit = async () => {
    if (!valid) {
      toast({ title: 'Champs requis', description: `Le prix doit être >= ${MIN_PRICE} €`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.id) throw new Error('Connexion requise');
      // Générer une référence lisible minimale (à affiner plus tard si besoin)
      const reference = `MP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const vehicle_type = (vehicleGroup === 'leger'
        ? 'berline'
        : vehicleGroup === 'utilitaire'
          ? 'utilitaire'
          : 'camion');
      const { error } = await supabase.from('missions').insert({
        reference,
        title: title.trim(),
        description: vehicleName.trim(),
        license_plate: license.trim(),
        pickup_address: `${pickupPostal.trim()} ${pickupCity.trim()} — ${pickup.trim()}`,
        delivery_address: `${dropPostal.trim()} ${dropCity.trim()} — ${drop.trim()}`,
        vehicle_type,
        donor_earning: Number(price),
        driver_earning: Number(price),
        created_by: auth.user.id,
        status: 'pending',
        // Note: quand les migrations missions_kind/vehicle_image_path/requirements seront appliquées,
        // on rebranchera ces champs et on régénèrera les types.
      });
      if (error) throw error;
      toast({ title: 'Mission publiée', description: 'Votre annonce est en ligne' });
      navigate('/marketplace');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Publication impossible', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Poster une mission (Marketplace)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Titre</Label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Livraison Berline" />
            </div>
            <div>
              <Label>Nom du véhicule</Label>
              <Input value={vehicleName} onChange={e=>setVehicleName(e.target.value)} placeholder="Ex: Peugeot 308" />
            </div>
            <div>
              <Label>Immatriculation</Label>
              <Input value={license} onChange={e=>setLicense(e.target.value)} placeholder="AB-123-CD" />
            </div>
            <div>
              <Label>Type de véhicule</Label>
              <Select value={vehicleGroup} onValueChange={(v)=>setVehicleGroup(v as any)}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leger">Léger</SelectItem>
                  <SelectItem value="utilitaire">Utilitaire</SelectItem>
                  <SelectItem value="poids_lourd">Poids lourd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <MapboxAddressInput label="Adresse de départ" placeholder="Ex: 10 Rue de la Paix, Paris" value={pickup} onChange={setPickup} onSelect={({address, city, postal})=>{ setPickup(address); if(city) setPickupCity(city); if(postal) setPickupPostal(postal); }} />
            </div>
            <div>
              <Label>Ville de départ</Label>
              <Input value={pickupCity} onChange={e=>setPickupCity(e.target.value)} placeholder="Ville" />
            </div>
            <div>
              <Label>Code postal départ</Label>
              <Input value={pickupPostal} onChange={e=>setPickupPostal(e.target.value)} placeholder="Code postal" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <MapboxAddressInput label="Adresse d'arrivée" placeholder="Ex: 20 Avenue de la République, Lyon" value={drop} onChange={setDrop} onSelect={({address, city, postal})=>{ setDrop(address); if(city) setDropCity(city); if(postal) setDropPostal(postal); }} />
            </div>
            <div>
              <Label>Ville d'arrivée</Label>
              <Input value={dropCity} onChange={e=>setDropCity(e.target.value)} placeholder="Ville" />
            </div>
            <div>
              <Label>Code postal arrivée</Label>
              <Input value={dropPostal} onChange={e=>setDropPostal(e.target.value)} placeholder="Code postal" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Image du véhicule</Label>
              <div className="flex items-center gap-3">
                <div className="w-28 h-20 border rounded bg-muted/40 flex items-center justify-center overflow-hidden">
                  {imagePath ? (
                    <img
                      src={getVehicleImageUrl({ image_path: imagePath })}
                      alt="aperçu"
                      className="object-contain w-full h-full"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fb = getVehicleImageUrl({ body_type: 'autre' });
                        if (target.src !== fb) target.src = fb;
                      }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Aucune</span>
                  )}
                </div>
                <Button variant="outline" type="button" onClick={()=>setImagePickerOpen(true)}>Choisir une image</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Obligatoire (85 images disponibles)</p>
            </div>
            <div>
              <Label>Prix proposé (€)</Label>
              <Input type="number" value={price} onChange={e=>setPrice(e.target.value)} min={MIN_PRICE} />
              <p className="text-xs text-muted-foreground mt-1">Minimum {MIN_PRICE} €</p>
            </div>
            <div className="space-y-2">
              <Label>Exigences</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2"><Checkbox checked={req.assurance} onCheckedChange={v=>setReq(s=>({...s, assurance: !!v}))}/> Assurance tous risques</label>
                <label className="flex items-center gap-2"><Checkbox checked={req.wgarage} onCheckedChange={v=>setReq(s=>({...s, wgarage: !!v}))}/> W garage</label>
                <label className="flex items-center gap-2"><Checkbox checked={req.plateau} onCheckedChange={v=>setReq(s=>({...s, plateau: !!v}))}/> Transporteur plateau</label>
                <label className="flex items-center gap-2"><Checkbox checked={req.porte10} onCheckedChange={v=>setReq(s=>({...s, porte10: !!v}))}/> Porte 10</label>
                <label className="flex items-center gap-2"><Checkbox checked={req.convoyeur} onCheckedChange={v=>setReq(s=>({...s, convoyeur: !!v}))}/> Convoyeur</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>navigate('/marketplace')}>Annuler</Button>
            <Button onClick={submit} disabled={submitting || !valid}>Publier</Button>
          </div>
        </CardContent>
      </Card>
  <VehicleImagePicker open={imagePickerOpen} onClose={()=>setImagePickerOpen(false)} onSelect={(p)=>setImagePath(p)} prefix="catalog" />
    </div>
  );
};

export default PostMarketplaceMission;

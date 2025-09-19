import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name || '');
        setDisplayName((data as any).display_name || data.full_name || '');
        setPhone((data as any).phone || '');
        setLocation((data as any).location || '');
        setBio((data as any).bio || '');
      }
    })();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // Upload avatar d'abord si fourni
      let avatar_url: string | null = null;
      if (avatar) {
        const ext = avatar.name.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from('avatars').upload(key, avatar, { upsert: true, contentType: avatar.type || 'image/jpeg' });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key);
        avatar_url = pub?.publicUrl || null;
      }

      const patch: any = {
        full_name: fullName || displayName,
        phone,
        // colonnes cross-app
        display_name: displayName || fullName,
        bio,
        location,
      };
      if (avatar_url) patch.avatar_url = avatar_url;

      // Utiliser le ProfileService pour une gestion sécurisée
      const success = await ProfileService.safeUpsertProfile({
        user_id: user.id,
        email: user.email || '',
        full_name: fullName || displayName || user.email?.split('@')[0] || '',
        phone,
        avatar_url,
        display_name: displayName || fullName,
        bio,
        location
      });

      if (!success) {
        throw new Error('Impossible de sauvegarder le profil. Veuillez réessayer.');
      }

      toast({ title: 'Profil enregistré', description: 'Votre compte est prêt sur toutes les plateformes.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erreur', description: e.message || 'Échec de la configuration du compte', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Bienvenue — Créons votre profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label>Nom d'affichage</Label>
                <Input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="Jean D." />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="06 12 34 56 78" />
              </div>
              <div className="space-y-2">
                <Label>Ville / Région</Label>
                <Input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Lyon, FR" />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Conducteur expérimenté, 5 ans" />
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <Input type="file" accept="image/*" onChange={(e)=>setAvatar(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" disabled={saving} className="w-full">{saving ? 'Enregistrement…' : 'Enregistrer mon profil'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

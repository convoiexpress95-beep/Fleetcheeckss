import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';

type DocRow = {
  id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  status: string | null;
  upload_date: string | null;
};

export default function VerificationPage(){
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [siret, setSiret] = useState('');
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [featureAvailable, setFeatureAvailable] = useState(false);

  useEffect(() => { (async () => {
    if (!user) return;
    // Vérifie la présence des colonnes/tables nécessaires en faisant des sélections HEAD
    try {
      const prof = await supabase.from('profiles').select('user_id', { count: 'exact', head: true }).limit(1);
      // Pas de colonne siret dans le schéma actuel; on ne tente pas de la lire
      const verif = await supabase.from('verification_documents' as any).select('id', { count: 'exact', head: true }).limit(1);
      setFeatureAvailable(!verif.error);
    } catch (_) {
      setFeatureAvailable(false);
    }
  })(); }, [user?.id]);

  const refreshDocs = async () => {
    if (!user || !featureAvailable) return;
    const { data } = await (supabase as any)
      .from('verification_documents')
      .select('id, document_type, document_name, document_url, status, upload_date')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });
    setDocs((data as DocRow[]) || []);
  };

  const saveSiret = async () => {
    if (!user) return;
    if (!/^\d{14}$/.test(siret.replace(/\D/g,''))) {
      toast({ title: 'SIRET invalide', description: 'Le SIRET doit contenir 14 chiffres.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Le champ siret n'existe pas actuellement; on stocke en attendant dans company_info si disponible
  const { error } = await (supabase as any).from('company_info').upsert({ user_id: user.id, siret, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast({ title: 'SIRET enregistré' });
    } catch (e:any) {
      toast({ title: 'Erreur', description: e?.message || 'Impossible de sauver le SIRET', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const upload = async (type: string, file: File) => {
  if (!user || !featureAvailable) return;
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${type}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('verification').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('verification').getPublicUrl(path);
      const url = urlData.publicUrl;
      const { error: insErr } = await (supabase as any)
        .from('verification_documents')
        .insert({ user_id: user.id, document_type: type, document_name: file.name, document_url: url, status: 'pending' });
      if (insErr) throw insErr;
      toast({ title: 'Document importé', description: `${file.name} envoyé` });
      await refreshDocs();
    } catch (e:any) {
      console.error(e);
      toast({ title: 'Échec import', description: e?.message || 'Envoi impossible', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const rows = [
    { key: 'kbis', label: 'KBIS' },
    { key: 'assurance_rc_pro', label: 'Assurance RC Pro' },
    { key: 'w_garage', label: 'Attestation W garage (optionnel)' },
    { key: 'permis_conduire', label: 'Permis de conduire (recto/verso)' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Shield className="w-5 h-5"/> Vérification du profil</CardTitle>
          <CardDescription>Devenez « convoyeur confirmé » en fournissant vos informations et documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-foreground">Numéro SIRET</Label>
            <div className="flex gap-2 mt-2 max-w-xl">
              <Input value={siret} onChange={(e)=>setSiret(e.target.value)} placeholder="12345678901234" />
              <Button onClick={saveSiret} disabled={loading}><Save className="w-4 h-4 mr-2"/>Enregistrer</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">SIRET à 14 chiffres. KBIS et RC Pro doivent correspondre.</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Documents requis</h3>
            {rows.map((r) => (
              <div key={r.key} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">Formats: PDF, JPG, PNG — max 10 Mo</p>
                  <div className="mt-2 space-y-1">
                    {docs.filter(d=>d.document_type===r.key).map(d => (
                      <div key={d.id} className="text-sm flex items-center gap-2">
                        <a className="underline" href={d.document_url} target="_blank" rel="noreferrer">{d.document_name}</a>
                        <Badge variant="outline">{d.status || 'en attente'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Button type="button" onClick={()=>document.getElementById(`verif-${r.key}`)?.click()} disabled={loading}>
                    <Upload className="w-4 h-4 mr-2"/>Importer
                  </Button>
                  <input id={`verif-${r.key}`} type="file" accept=".pdf,image/*" className="hidden" onChange={(e)=>{
                    const f = e.target.files?.[0]; if (f) upload(r.key, f); (e.target as HTMLInputElement).value='';
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

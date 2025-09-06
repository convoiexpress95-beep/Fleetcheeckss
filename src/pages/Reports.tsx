import React, { useMemo, useState } from 'react';
import { FileText, Download, Mail, Eye, Search, MapPin, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { BRAND_NAME, BRAND_LOGO_LOCAL } from "@/lib/branding";

type MissionRow = {
  id: string;
  title: string;
  reference: string;
  pickup_address?: string | null;
  delivery_address?: string | null;
  created_at: string;
};

async function fetchCompletedMissions(): Promise<MissionRow[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('id, title, reference, pickup_address, delivery_address, created_at')
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as MissionRow[];
}

const Reports = () => {
  const [missions, setMissions] = useState<MissionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // État pour le modal "Rapport complet" (cohérent avec mobile)
  const [viewing, setViewing] = useState<MissionRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [depDetails, setDepDetails] = useState<any | null>(null);
  const [arrDetails, setArrDetails] = useState<any | null>(null);
  const [depPhotos, setDepPhotos] = useState<string[]>([]);
  const [arrPhotos, setArrPhotos] = useState<string[]>([]);
  const [depSigUrl, setDepSigUrl] = useState<string | null>(null);
  const [arrSigUrl, setArrSigUrl] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const m = await fetchCompletedMissions();
        setMissions(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const baseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lucpsjwaglmiejpfxofe.supabase.co';
  const publicUrlFor = (path?: string | null) => {
    if (!path) return null as string | null;
    if (/^https?:\/\//i.test(path)) return path;
    const key = normalizeKey(path) as string;
    const { data } = supabase.storage.from('mission-photos').getPublicUrl(key);
    return data.publicUrl || `${baseUrl}/storage/v1/object/public/mission-photos/${key}`;
  };

  const normalizeKey = (path?: string | null) => {
    if (!path) return null as string | null;
    if (/^https?:\/\//i.test(path)) return path; // déjà une URL publique
    let key = path.replace(/^\/+/, '');
    // Retire préfixes éventuels
    const pubPrefix = `/storage/v1/object/public/mission-photos/`;
    const fullPrefix = `${baseUrl}${pubPrefix}`;
    if (key.startsWith(fullPrefix)) key = key.slice(fullPrefix.length);
    if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
    if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
    return key;
  };

  const dataUrlSignatureMaybe = (obj: any): string | null => {
    const cand = obj?.client_signature_data || obj?.client_signature_base64 || obj?.client_signature || null;
    if (!cand || typeof cand !== 'string') return null;
    if (cand.startsWith('data:image')) return cand;
    if (/^[A-Za-z0-9+/=]+$/.test(cand) && cand.length > 100) return `data:image/png;base64,${cand}`;
    return null;
  };

  const loadMissionDetails = async (m: MissionRow) => {
    setViewLoading(true);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);
      setDepDetails(dep || null);
      setArrDetails(arr || null);
      const depP = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrP = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      setDepPhotos(depP);
      setArrPhotos(arrP);
      const depSig = dataUrlSignatureMaybe(dep) || publicUrlFor((dep as any)?.client_signature_url as string | null);
      const arrSig = dataUrlSignatureMaybe(arr) || publicUrlFor((arr as any)?.client_signature_url as string | null);
      setDepSigUrl(depSig);
      setArrSigUrl(arrSig);
    } finally {
      setViewLoading(false);
    }
  };

  const openFullReport = async (m: MissionRow) => {
    setViewing(m);
    await loadMissionDetails(m);
  };

  const closeFullReport = () => {
    setViewing(null);
    setDepDetails(null);
    setArrDetails(null);
    setDepPhotos([]);
    setArrPhotos([]);
    setDepSigUrl(null);
    setArrSigUrl(null);
  };

  const exportPdf = async (m: MissionRow) => {
    setBusyId(m.id);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);

      const signMaybe = async (path?: string | null) => {
        if (!path) return null as string | null;
        if (/^https?:\/\//i.test(path)) return path;
        const key = normalizeKey(path) as string;
        const { data } = await supabase.storage.from('mission-photos').createSignedUrl(key, 60 * 60);
        return data?.signedUrl || publicUrlFor(key);
      };

      const depSig = await signMaybe((dep as any)?.client_signature_url as string | null);
      const arrSig = await signMaybe((arr as any)?.client_signature_url as string | null);

      const esc = (v: any) => (v == null || v === '' ? '-' : String(v));

  const logo = BRAND_LOGO_LOCAL;
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Rapport ${m.reference}</title>
            <style>
              body { font-family: Arial, sans-serif; background: #f8fafc; padding: 24px; }
              .frame { background: #ffffff; border: 4px solid #2563eb; border-radius: 12px; padding: 20px; }
              .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
              .brand { display:flex; align-items:center; gap: 10px; }
              .brand img { height: 36px; width: auto; border-radius: 10px; }
              .brand .name { font-weight: 800; color:#2563eb; }
              .title { font-size: 22px; font-weight: 700; color: #111827; }
              .muted { color: #6b7280; }
              h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              td, th { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
              .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
              .signs { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
              .sign { border: 1px dashed #c7d2fe; border-radius: 8px; padding: 10px; text-align:center; }
              .sign img { max-width: 100%; max-height: 160px; object-fit: contain; }
            </style>
          </head>
          <body>
            <div class="frame">
              <div class="header">
                <div class="brand"><img src="${logo}" onerror="this.src='https://i.ibb.co/xqf1LCDC/Chat-GPT-Image-6-sept-2025-01-04-56.png'" alt="${BRAND_NAME}" /><span class="name">${BRAND_NAME}</span></div>
                <div class="title">Rapport de mission – ${esc(m.title)}</div>
                <div class="muted">Réf: ${esc(m.reference)}</div>
              </div>
              <div class="muted">De ${esc(m.pickup_address)} à ${esc(m.delivery_address)}</div>
              <div class="grid">
                <div>
                  <h2>Départ</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((dep as any)?.initial_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((dep as any)?.initial_fuel)}</td></tr>
                    <tr><th>Notes internes</th><td>${esc((dep as any)?.internal_notes)}</td></tr>
                    <tr><th>Email client</th><td>${esc((dep as any)?.client_email)}</td></tr>
                  </table>
                </div>
                <div>
                  <h2>Arrivée</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((arr as any)?.final_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((arr as any)?.final_fuel)}</td></tr>
                    <tr><th>Notes conducteur</th><td>${esc((arr as any)?.driver_notes)}</td></tr>
                    <tr><th>Notes client</th><td>${esc((arr as any)?.client_notes)}</td></tr>
                  </table>
                </div>
              </div>
              <div class="signs">
                <div class="sign">
                  <div class="muted">Signature départ</div>
                  ${depSig ? `<img src="${depSig}" alt="Signature départ" />` : `<div class="muted">(Aucune)</div>`}
                </div>
                <div class="sign">
                  <div class="muted">Signature arrivée</div>
                  ${arrSig ? `<img src="${arrSig}" alt="Signature arrivée" />` : `<div class="muted">(Aucune)</div>`}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setBusyId(null);
    }
  };

  const emailFullReport = async (m: MissionRow) => {
    setBusyId(m.id);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('photos').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('photos').eq('mission_id', m.id).maybeSingle(),
      ]);
      const depPhotos = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrPhotos = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      const all = [...depPhotos, ...arrPhotos];
      const links = all.map((p, i) => `Photo ${i + 1}: ${publicUrlFor(p)}`).join('\n');
      const fnUrl = `${baseUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}`;
      const subject = encodeURIComponent(`Rapport de mission ${m.reference}`);
      const body = encodeURIComponent(`Bonjour,\n\nRapport: ${m.reference} – ${m.title}\nPDF (bundle photos): ${fnUrl}\n\nLiens photos:\n${links}\n\nCordialement`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } finally { setBusyId(null); }
  };

  // Plus de partage photo isolée: on aligne avec mobile (3 actions only)

  const downloadZip = async (m: MissionRow) => {
    setBusyId(m.id);
    try {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;
  const fnUrl = `${baseUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}`;
      const res = await fetch(fnUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) {
        window.open(fnUrl, '_blank');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
  a.download = `mission-${m.reference || m.id}-photos.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally { setBusyId(null); }
  };

  const filtered = useMemo(() => {
    if (!missions) return [] as MissionRow[];
    const q = query.trim().toLowerCase();
    if (!q) return missions;
    return missions.filter(m =>
      [m.title, m.reference, m.pickup_address, m.delivery_address]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [missions, query]);

  const refresh = async () => {
    setLoading(true);
    try {
      const m = await fetchCompletedMissions();
      setMissions(m);
    } finally {
      setLoading(false);
    }
  };

  const openPhoto = async (path: string) => {
    // Le bucket est public: ouvrons directement l’URL publique en normalisant la clé
    const key = normalizeKey(path);
    const url = publicUrlFor(key) || publicUrlFor(path) || '#';
    window.open(url, '_blank');
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent drop-shadow">Rapports</h1>
            <p className="text-muted-foreground">Missions terminées et export de rapports</p>
          </div>
        </div>

        {/* Barre d'actions */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="relative md:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par titre, référence ou adresse..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={refresh} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Rafraîchir
                </Button>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline">
                  Haut de page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des missions */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8">
                <div className="h-4 w-40 bg-muted animate-pulse rounded mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ) : !missions || missions.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                Aucune mission finalisée
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                Aucun résultat pour “{query}”.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filtered.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 hover:bg-card/60 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate max-w-[50vw] sm:max-w-[40vw]">{m.title}</span>
                        <Badge variant="outline" className="text-primary border-primary/40">{m.reference}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {m.pickup_address || '-'}
                        <span>→</span>
                        {m.delivery_address || '-'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* 1) Voir rapport complet (modal) */}
                      <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => openFullReport(m)} disabled={busyId===m.id}>
                        <Eye className="w-4 h-4 mr-1" /> Voir
                      </Button>
                      {/* 2) Email (liens + PDF bundle) */}
                      <Button size="sm" variant="secondary" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => emailFullReport(m)} disabled={busyId===m.id}>
                        <Mail className="w-4 h-4 mr-1" /> Email
                      </Button>
                      {/* 3) Télécharger tout (Edge PDF bundle) */}
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => downloadZip(m)} disabled={busyId===m.id} title="Télécharger toutes les photos (PDF)">
                        <Download className="w-4 h-4 mr-1" /> Tout (PDF)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  </div>
  {/* Modal Rapport Complet */}
    {viewing && (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={closeFullReport} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="font-semibold">Rapport complet</div>
              <button className="p-1 rounded hover:bg-muted/30" onClick={closeFullReport} aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewLoading ? (
              <div className="p-8 text-center text-muted-foreground">Chargement…</div>
            ) : (
              <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-foreground">{viewing.title}</div>
                  <div className="text-sm text-muted-foreground">Réf: {viewing.reference}</div>
                  <div className="text-sm text-muted-foreground">De: {viewing.pickup_address || '-'}</div>
                  <div className="text-sm text-muted-foreground">À: {viewing.delivery_address || '-'}</div>
                </div>
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-primary mb-2">Départ</div>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr><th className="text-left align-top pr-2">Kilométrage</th><td className="text-muted-foreground">{depDetails?.initial_mileage ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Carburant</th><td className="text-muted-foreground">{depDetails?.initial_fuel ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Email client</th><td className="text-muted-foreground">{depDetails?.client_email ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Notes internes</th><td className="text-muted-foreground">{depDetails?.internal_notes ?? '-'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-primary mb-2">Arrivée</div>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr><th className="text-left align-top pr-2">Kilométrage</th><td className="text-muted-foreground">{arrDetails?.final_mileage ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Carburant</th><td className="text-muted-foreground">{arrDetails?.final_fuel ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Notes conducteur</th><td className="text-muted-foreground">{arrDetails?.driver_notes ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Notes client</th><td className="text-muted-foreground">{arrDetails?.client_notes ?? '-'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-primary mb-2">Signatures</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-border/60 rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Départ</div>
                      {depSigUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={depSigUrl} alt="Signature départ" className="max-h-56 w-full object-contain rounded" />
                      ) : (
                        <div className="text-sm text-muted-foreground">(Aucune)</div>
                      )}
                    </div>
                    <div className="border border-border/60 rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Arrivée</div>
                      {arrSigUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={arrSigUrl} alt="Signature arrivée" className="max-h-56 w-full object-contain rounded" />
                      ) : (
                        <div className="text-sm text-muted-foreground">(Aucune)</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-primary mb-2">Photos départ</div>
                  <div className="grid grid-cols-3 gap-2">
                    {depPhotos.length === 0 ? (
                      <div className="text-sm text-muted-foreground">(Aucune)</div>
                    ) : depPhotos.map((p, idx) => (
                      <button key={`dep-${idx}`} onClick={() => openPhoto(p)} className="block rounded-lg overflow-hidden border border-border hover:border-primary/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={publicUrlFor(p) || undefined} alt={`Photo départ ${idx+1}`} className="w-full h-28 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-surface border border-border/60 rounded-lg p-3">
                  <div className="font-semibold text-primary mb-2">Photos arrivée</div>
                  <div className="grid grid-cols-3 gap-2">
                    {arrPhotos.length === 0 ? (
                      <div className="text-sm text-muted-foreground">(Aucune)</div>
                    ) : arrPhotos.map((p, idx) => (
                      <button key={`arr-${idx}`} onClick={() => openPhoto(p)} className="block rounded-lg overflow-hidden border border-border hover:border-primary/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={publicUrlFor(p) || undefined} alt={`Photo arrivée ${idx+1}`} className="w-full h-28 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Reports;
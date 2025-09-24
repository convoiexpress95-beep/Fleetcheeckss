import React, { useMemo, useState, useCallback } from 'react';
import { FileText, Mail, Eye, Search, MapPin, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Types
interface MissionRow {
  id: string;
  title: string;
  reference: string;
  pickup_address?: string | null;
  delivery_address?: string | null;
  created_at: string;
  archived?: boolean | null;
}

async function fetchCompletedMissions(showArchived = false): Promise<MissionRow[]> {
  // Diagnostic: essayons d'abord de récupérer une seule mission pour voir sa structure
  const { data: testData, error: testError } = await supabase
    .from('missions')
    .select('*')
    .limit(1);
  
  if (testError) {
    console.error('Test error:', testError);
  } else {
    console.log('Mission table structure sample:', testData?.[0]);
  }

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('Error fetching missions:', error);
    throw error;
  }
  const list = (data || []) as any[];
  return list
    .filter(m => Boolean(m.archived) === Boolean(showArchived))
    .map(m => ({
      id: m.id,
      title: m.title,
      reference: m.reference,
      pickup_address: m.pickup_address,
      delivery_address: m.delivery_address,
      created_at: m.created_at,
      archived: m.archived ?? false,
    })) as MissionRow[];
}

// Helpers (pure)
const normalizeKey = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // déjà une URL
  // Nettoyer d'éventuels préfixes absolus (quel que soit le domaine)
  let key = path.replace(/^\/+/, '');
  // Supprime le domaine s'il est présent, en ne gardant que le chemin
  key = key.replace(/^https?:\/\/[^/]+\//i, '');
  // Supprime le chemin public supabase si présent
  const pubPrefix = 'storage/v1/object/public/mission-photos/';
  if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
  if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
  return key;
};

interface InspectionDeparture {
  photos?: unknown;
  initial_mileage?: number | string | null;
  initial_fuel?: number | string | null;
  fuel_percent?: number | null;
  keys_count?: number | null;
  has_fuel_card?: boolean | null;
  has_board_documents?: boolean | null;
  has_delivery_report?: boolean | null;
  client_email?: string | null;
  internal_notes?: string | null;
  client_signature_data?: string;
  client_signature_base64?: string;
  client_signature?: string;
  client_signature_url?: string | null;
}

interface InspectionArrival {
  photos?: unknown;
  final_mileage?: number | string | null;
  final_fuel?: number | string | null;
  driver_notes?: string | null;
  client_notes?: string | null;
  client_signature_data?: string;
  client_signature_base64?: string;
  client_signature?: string;
  client_signature_url?: string | null;
}

type GenericSignatureSource = { [k: string]: unknown } | null | undefined;

const dataUrlSignatureMaybe = (obj: GenericSignatureSource): string | null => {
  const cand = obj?.client_signature_data || obj?.client_signature_base64 || obj?.client_signature || null;
  if (!cand || typeof cand !== 'string') return null;
  if (cand.startsWith('data:image')) return cand;
  if (/^[A-Za-z0-9+/=]+$/.test(cand) && cand.length > 100) return `data:image/png;base64,${cand}`;
  return null;
};

// (Les sous-composants factorisés ont été retirés pour simplifier après correction.)

const Reports = () => {
  const [missions, setMissions] = useState<MissionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // État pour le modal "Rapport complet" (cohérent avec mobile)
  const [viewing, setViewing] = useState<MissionRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [depDetails, setDepDetails] = useState<InspectionDeparture | null>(null);
  const [arrDetails, setArrDetails] = useState<InspectionArrival | null>(null);
  const [depPhotos, setDepPhotos] = useState<string[]>([]);
  const [arrPhotos, setArrPhotos] = useState<string[]>([]);
  const [depSigUrl, setDepSigUrl] = useState<string | null>(null);
  const [arrSigUrl, setArrSigUrl] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const m = await fetchCompletedMissions(showArchived);
        setMissions(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [showArchived]);

  const publicUrlFor = useCallback((path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const key = normalizeKey(path);
    if (!key) return null;
    const { data } = supabase.storage.from('mission-photos').getPublicUrl(key);
    return data.publicUrl || null;
  }, []);

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
  const depSig = dataUrlSignatureMaybe(dep) || publicUrlFor(dep?.client_signature_url || null);
  const arrSig = dataUrlSignatureMaybe(arr) || publicUrlFor(arr?.client_signature_url || null);
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

  // exportPdf retiré (non utilisé dans l'UI)

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
      // Build PNG links via Edge Function for consistent downloads
      const projectUrl = (supabase as any).rest?.url?.replace(/\/rest\/v1\/?$/, '') || (import.meta as any)?.env?.VITE_SUPABASE_URL || '';
      const links = all.map((p, i) => {
        let key = normalizeKey(p);
        const href = projectUrl && key ? `${projectUrl}/functions/v1/photo-png?path=${encodeURIComponent(key)}` : (publicUrlFor(p) || '#');
        return `Photo ${i + 1}: ${href}`;
      }).join('\n');
  // Construit l'URL de la fonction à partir de l'URL du projet courant du client
  const fnUrl = projectUrl ? `${projectUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}` : '';
      const subject = encodeURIComponent(`Rapport de mission ${m.reference}`);
      const body = encodeURIComponent(`Bonjour,\n\nRapport: ${m.reference} – ${m.title}\nPDF (bundle photos): ${fnUrl}\n\nLiens photos:\n${links}\n\nCordialement`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } finally { setBusyId(null); }
  };

  const emailFullReportGmail = async (m: MissionRow) => {
    setBusyId(m.id);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('photos').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('photos').eq('mission_id', m.id).maybeSingle(),
      ]);
      const depPhotos = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrPhotos = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      const all = [...depPhotos, ...arrPhotos];
      const projectUrl = (supabase as any).rest?.url?.replace(/\/rest\/v1\/?$/, '') || (import.meta as any)?.env?.VITE_SUPABASE_URL || '';
      const links = all.map((p, i) => {
        let key = normalizeKey(p);
        const href = projectUrl && key ? `${projectUrl}/functions/v1/photo-png?path=${encodeURIComponent(key)}` : (publicUrlFor(p) || '#');
        return `Photo ${i + 1}: ${href}`;
      }).join('%0A');
      const fnUrl = projectUrl ? `${projectUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}` : '';
      const subject = encodeURIComponent(`Rapport de mission ${m.reference}`);
      const bodyPrefix = encodeURIComponent(`Bonjour,\n\nRapport: ${m.reference} – ${m.title}\nPDF (bundle photos): ${fnUrl}\n\nLiens photos:\n`);
      const bodySuffix = encodeURIComponent(`\n\nCordialement`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${bodyPrefix}${links}${bodySuffix}`;
      window.open(gmailUrl, '_blank');
    } finally { setBusyId(null); }
  };

  // Plus de partage photo isolée: on aligne avec mobile (3 actions only)

  const downloadZip = async (m: MissionRow) => {
    setBusyId(m.id);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
  const projectUrl = (supabase as any).rest?.url?.replace(/\/rest\/v1\/?$/, '') || (import.meta as any)?.env?.VITE_SUPABASE_URL || '';
  const fnUrl = projectUrl ? `${projectUrl}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}` : '';
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
      const m = await fetchCompletedMissions(showArchived);
      setMissions(m);
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (m: MissionRow, value: boolean) => {
    setBusyId(m.id);
    try {
  const { error } = await supabase.from('missions').update({ archived: value } as any).eq('id', m.id);
      if (error) throw error;
      await refresh();
    } finally { setBusyId(null); }
  };

  const openPhoto = async (path: string) => {
    const key = normalizeKey(path);
    // Build photo-png link for best UX in mail/web
    const base = (supabase as any).rest?.url?.replace(/\/rest\/v1\/?$/, '') || '';
    const pngUrl = base ? `${base}/functions/v1/photo-png?path=${encodeURIComponent(key || path)}` : (publicUrlFor(key) || publicUrlFor(path) || '#');
    window.open(pngUrl, '_blank');
  };

  // Petits composants internes pour supprimer duplication
  const SignatureBlock: React.FC<{ label: string; url: string | null }> = ({ label, url }) => (
    <div className="border border-border/60 rounded-lg p-3 text-center">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      {url ? (
        <img src={url} alt={label} className="max-h-56 w-full object-contain rounded" />
      ) : (
        <div className="text-sm text-muted-foreground">(Aucune)</div>
      )}
    </div>
  );

  const PhotoSection: React.FC<{ title: string; photos: string[]; prefix: string }> = ({ title, photos, prefix }) => (
    <div className="bg-surface border border-border/60 rounded-lg p-3">
      <div className="font-semibold text-primary mb-2">{title}</div>
      <div className="grid grid-cols-3 gap-2">
        {photos.length === 0 ? (
          <div className="text-sm text-muted-foreground">(Aucune)</div>
        ) : photos.map((p, idx) => (
          <button key={`${prefix}-${idx}`} onClick={() => openPhoto(p)} className="block rounded-lg overflow-hidden border border-border hover:border-primary/60">
            <img src={publicUrlFor(p) || undefined} alt={`${title} ${idx + 1}`} className="w-full h-28 object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent drop-shadow">Rapports</h1>
            <p className="text-muted-foreground">Missions terminées et rapports</p>
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
                <Button variant={showArchived? 'default':'outline'} onClick={() => setShowArchived(s=>!s)}>
                  {showArchived ? 'Voir actifs' : 'Voir archivés'}
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
                      <Button size="sm" variant="default" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => openFullReport(m)} disabled={busyId===m.id}>
                        <Eye className="w-4 h-4 mr-1" /> Voir
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => emailFullReport(m)} disabled={busyId===m.id}>
                          <Mail className="w-4 h-4 mr-1" /> Email
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => emailFullReportGmail(m)} disabled={busyId===m.id} title="Ouvrir Gmail">
                          Gmail
                        </Button>
                      </div>
                      {m.archived ? (
                        <Button size="sm" variant="outline" onClick={() => toggleArchive(m, false)} disabled={busyId===m.id}>Désarchiver</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => toggleArchive(m, true)} disabled={busyId===m.id}>Archiver</Button>
                      )}
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
              <button className="p-1 rounded hover:bg-cyan-500/30" onClick={closeFullReport} aria-label="Fermer">
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
                      <tr><th className="text-left align-top pr-2">% Carburant</th><td className="text-muted-foreground">{depDetails?.fuel_percent ?? '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Clés</th><td className="text-muted-foreground">{depDetails?.keys_count != null ? (depDetails?.keys_count === 2 ? '2+' : String(depDetails?.keys_count)) : '-'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Carte carburant</th><td className="text-muted-foreground">{depDetails?.has_fuel_card ? 'Oui' : 'Non'}</td></tr>
                      <tr><th className="text-left align-top pr-2">Docs de bord</th><td className="text-muted-foreground">{depDetails?.has_board_documents ? 'Oui' : 'Non'}</td></tr>
                      <tr><th className="text-left align-top pr-2">PV de livraison</th><td className="text-muted-foreground">{depDetails?.has_delivery_report ? 'Oui' : 'Non'}</td></tr>
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
                    <SignatureBlock label="Départ" url={depSigUrl} />
                    <SignatureBlock label="Arrivée" url={arrSigUrl} />
                  </div>
                </div>
                <PhotoSection title="Photos départ" photos={depPhotos} prefix="dep" />
                <PhotoSection title="Photos arrivée" photos={arrPhotos} prefix="arr" />
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
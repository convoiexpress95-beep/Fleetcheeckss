import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminRoute } from '@/components/AdminRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Upload, RefreshCw, Copy, Images } from 'lucide-react';
import { getVehicleImageUrl } from '@/lib/utils';

type FileRow = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  metadata?: any;
};

const Catalog: React.FC = () => {
  const prefix = 'catalog'; // dossier des 85 images
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dirRef = useRef<HTMLInputElement | null>(null);
  const [subfolder, setSubfolder] = useState(''); // ex: volkswagen, peugeot/208
  const [urlsText, setUrlsText] = useState('');
  const [importing, setImporting] = useState(false);
  const [categoriesText, setCategoriesText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<string>('');

  async function load() {
    setLoading(true);
    try {
      const fullPrefix = subfolder.trim() ? `${prefix}/${sanitizePath(subfolder)}` : prefix;
      const { data, error } = await supabase.storage
        .from('vehicle-assets')
        .list(fullPrefix, { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      setFiles((data || []).filter((f: any) => !f.name.endsWith('/')) as FileRow[]);
    } catch (e) {
      console.error('Storage list error', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [subfolder]);

  // Set non-standard directory selection attributes imperatively to avoid TS errors
  useEffect(() => {
    if (dirRef.current) {
      try {
        dirRef.current.setAttribute('webkitdirectory', '');
        dirRef.current.setAttribute('directory', '');
      } catch (_) {}
    }
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return files;
    return files.filter(f => f.name.toLowerCase().includes(term));
  }, [files, q]);

  async function handleUpload(filesList: FileList | null) {
    if (!filesList || filesList.length === 0) return;
    setBusy(true);
    try {
      const basePrefix = subfolder.trim() ? `${prefix}/${sanitizePath(subfolder)}` : prefix;
      for (const file of Array.from(filesList)) {
        const rel = (file as any).webkitRelativePath as string | undefined;
        // Conserve la structure du dossier sélectionné si disponible (après le dossier racine)
        let sub = rel ? rel.split(/[/\\]/).slice(1).join('/') : file.name;
        sub = sub.replace(/\s+/g, '_');
        const path = `${basePrefix}/${sub}`.toLowerCase();
        const { error } = await supabase.storage
          .from('vehicle-assets')
          .upload(path, file, { contentType: file.type || 'image/*', upsert: true });
        if (error) throw error;
      }
      await load();
    } catch (e) {
      console.error('Upload error', e);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
      if (dirRef.current) dirRef.current.value = '';
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    setBusy(true);
    try {
      const { error } = await supabase.storage
        .from('vehicle-assets')
        .remove([`${prefix}/${name}`]);
      if (error) throw error;
      await load();
    } catch (e) {
      console.error('Delete error', e);
    } finally {
      setBusy(false);
    }
  }

  function copyPath(name: string) {
    const basePrefix = subfolder.trim() ? `${prefix}/${sanitizePath(subfolder)}` : prefix;
    const p = `${basePrefix}/${name}`;
    navigator.clipboard?.writeText(p).catch(() => {});
  }

  function sanitizePath(s: string) {
    return s
      .replace(/\\/g, '/')
      .split('/')
      .map((part) => part.trim().replace(/\s+/g, '_').toLowerCase())
      .filter(Boolean)
      .join('/');
  }

  async function importFromUrls() {
    const lines = urlsText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setImporting(true);
    const basePrefix = subfolder.trim() ? `${prefix}/${sanitizePath(subfolder)}` : prefix;
    try {
      // Call Edge Function (server-side import to bypass CORS)
      const { data, error } = await supabase.functions.invoke('import-from-url', {
        body: { urls: lines, targetPrefix: basePrefix },
      });
      if (error) throw error;
      // Optionally inspect results: data.results
      await load();
    } catch (e) {
      console.error('Edge import error', e);
    } finally {
      setImporting(false);
    }
  }

  async function handleBulkCategoriesImport() {
    const lines = categoriesText.split(/\r?\n/);
    const sep = /^-+$/;
    const brandHeader = /^(?!https?:\/\/)[a-zA-ZÀ-ÿ0-9][^]*$/; // line not starting with URL
    const urlLine = /^https?:\/\//i;
    const map: Record<string, string[]> = {};
    let current: string | null = null;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || sep.test(line)) continue;
      if (urlLine.test(line)) {
        const brand = current || 'divers';
        map[brand] = map[brand] || [];
        map[brand].push(line);
      } else {
        // Could be "Cupra https://..." on same line
        const parts = line.split(/\s+/);
        const firstIsUrl = urlLine.test(parts[0] || '');
        if (!firstIsUrl) {
          // Treat first token(s) until a URL as brand
          const urlIndex = parts.findIndex(p => urlLine.test(p));
          if (urlIndex === -1) {
            current = sanitizePath(line.toLowerCase());
            if (!current) current = 'divers';
          } else {
            const brandName = sanitizePath(parts.slice(0, urlIndex).join(' ').toLowerCase()) || 'divers';
            const urls = parts.slice(urlIndex).filter(p => urlLine.test(p));
            map[brandName] = map[brandName] || [];
            map[brandName].push(...urls);
            current = brandName;
          }
        } else {
          // Line starts with URL without brand
          const brand = current || 'divers';
          map[brand] = map[brand] || [];
          map[brand].push(line);
        }
      }
    }

    setBulkImporting(true);
    try {
      const summaries: string[] = [];
      for (const [brand, urls] of Object.entries(map)) {
        if (!urls.length) continue;
        const target = `${prefix}/${sanitizePath(brand)}`;
        try {
          const { data, error } = await supabase.functions.invoke('import-from-url', {
            body: { urls, targetPrefix: target },
          });
          if (error) throw error;
          const ok = (data?.results || []).filter((r: any) => r.ok).length;
          const ko = (data?.results || []).length - ok;
          summaries.push(`${brand}: ${ok} ok${ko ? `, ${ko} ko` : ''}`);
        } catch (e) {
          summaries.push(`${brand}: erreur`);
          console.error('Bulk brand import error', brand, e);
        }
      }
      setBulkSummary(summaries.join(' | '));
      await load();
    } finally {
      setBulkImporting(false);
    }
  }

  return (
    <AdminRoute>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Catalogue images</h1>
            <p className="text-sm text-muted-foreground">Gérez les 85 images utilisées pour illustrer les véhicules (bucket 'vehicle-assets/{prefix}').</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={load} disabled={loading || busy}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </Button>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Téléversement</CardTitle>
            <CardDescription>
              Glissez-déposez ou sélectionnez plusieurs fichiers.
              Les images seront stockées dans
              {' '}<Badge variant="outline">vehicle-assets/{prefix}{subfolder ? `/${sanitizePath(subfolder)}` : ''}</Badge>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <Input
                placeholder="Sous-dossier (ex: volkswagen ou volkswagen/golf)"
                value={subfolder}
                onChange={(e) => setSubfolder(e.target.value)}
                className="max-w-sm"
              />
              {/* Sélecteur de fichiers multiples */}
              <Input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} disabled={busy} />
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
                <Upload className="w-4 h-4 mr-2" /> Sélectionner des images
              </Button>
              {/* Sélecteur de dossier (webkitdirectory) */}
              <input 
                ref={dirRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={busy}
              />
              <Button type="button" variant="outline" onClick={() => dirRef.current?.click()} disabled={busy}>
                <Upload className="w-4 h-4 mr-2" /> Sélectionner un dossier
              </Button>
              {busy && <span className="text-sm text-muted-foreground">Traitement en cours…</span>}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <label className="text-sm text-muted-foreground">Importer depuis des URLs (une par ligne) — peut échouer selon CORS, sinon télécharge localement puis utilisez le bouton Dossier.</label>
              <textarea
                className="w-full h-28 resize-vertical rounded-md border bg-background p-2 text-sm"
                placeholder={`https://exemple.com/image1.webp\nhttps://exemple.com/image2.png`}
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={importFromUrls} disabled={importing || !urlsText.trim()}>
                    {importing ? 'Import…' : 'Importer via serveur (recommandé)'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Images ({files.length})</CardTitle>
            <CardDescription>Recherchez par nom de fichier et copiez le chemin pour l'utiliser dans la création de mission.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer par nom…" className="max-w-xs" />
            </div>
            <Separator className="mb-4" />
            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucune image. Téléversez vos fichiers dans vehicle-assets/{prefix}{subfolder ? `/${sanitizePath(subfolder)}` : ''}.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((f) => {
                  const basePrefix = subfolder.trim() ? `${prefix}/${sanitizePath(subfolder)}` : prefix;
                  const path = `${basePrefix}/${f.name}`;
                  const src = getVehicleImageUrl({ image_path: path });
                  return (
                    <div key={path} className="border border-white/10 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                        <img
                          src={src}
                          alt={f.name}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const fb = getVehicleImageUrl({ body_type: 'autre' });
                            if (target.src !== fb) target.src = fb;
                          }}
                        />
                      </div>
                      <div className="p-2 text-xs">
                        <div className="truncate" title={f.name}>{f.name}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyPath(f.name)} title="Copier le chemin">
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copier
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(f.name)} disabled={busy} title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Importation par catégories (bloc texte) */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Import par catégories</CardTitle>
            <CardDescription>
              Collez un bloc de texte contenant des marques et des URLs. Chaque marque deviendra un sous-dossier.
              Exemples de lignes valides: "Renault", "https://…", ou "Cupra https://…".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <textarea
                className="w-full h-40 resize-vertical rounded-md border bg-background p-2 text-sm"
                placeholder={`Renault\nhttps://i.exemple.com/a.jpg\nhttps://i.exemple.com/b.webp\n-----------------------------\nPeugeot\nhttps://i.exemple.com/c.png`}
                value={categoriesText}
                onChange={(e) => setCategoriesText(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleBulkCategoriesImport} disabled={bulkImporting || !categoriesText.trim()}>
                  {bulkImporting ? 'Import catégories…' : 'Importer par catégories (via serveur)'}
                </Button>
                {bulkSummary && <span className="text-xs text-muted-foreground">{bulkSummary}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  );
};

export default Catalog;

// Helpers below component to keep file tidy
// Implemented inside component scope via binding

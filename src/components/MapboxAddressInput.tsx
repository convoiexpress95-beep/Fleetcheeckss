import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (payload: { address: string; city?: string; postal?: string }) => void;
  country?: string; // default FR
};

type Feature = {
  id: string;
  place_name: string;
  text?: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
};

const extractCityPostal = (f: Feature) => {
  let city: string | undefined;
  let postal: string | undefined;
  (f.context || []).forEach((c) => {
    if (c.id.startsWith('place') || c.id.startsWith('locality')) city = c.text;
    if (c.id.startsWith('postcode')) postal = c.text;
  });
  return { city, postal };
};

const MapboxAddressInput: React.FC<Props> = ({ label, placeholder, value, onChange, onSelect, country = 'fr' }) => {
  const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const acRef = useRef<AbortController | null>(null);

  const fetchUrl = useMemo(() => {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?types=address,place,locality&language=fr&country=${country}&limit=5&access_token=${token}`;
  }, [value, token, country]);

  useEffect(() => {
    if (!token) return;
    if (!value || value.trim().length < 3) { setItems([]); setOpen(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    acRef.current?.abort();
    acRef.current = ctrl;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(fetchUrl, { signal: ctrl.signal });
        if (!res.ok) throw new Error('geocode failed');
        const json = await res.json();
        setItems((json.features || []).slice(0,5));
        setOpen(true);
      } catch (_e) {
        if (!ctrl.signal.aborted) setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [fetchUrl, token]);

  return (
    <div className="relative">
      {label && <div className="mb-1 text-sm font-medium">{label}</div>}
      <Input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>{ if(items.length) setOpen(true); }} onBlur={()=> setTimeout(()=>setOpen(false), 150)} />
      {open && (items.length > 0 || loading) && (
        <Card className="absolute z-50 mt-1 w-full p-1">
          {loading && <div className="px-2 py-1 text-xs text-muted-foreground">Recherche…</div>}
          {!loading && items.map((it) => (
            <button key={it.id} type="button" className="w-full text-left px-2 py-2 rounded hover:bg-muted text-sm" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{
              const meta = extractCityPostal(it);
              onSelect({ address: it.place_name, city: meta.city, postal: meta.postal });
              setOpen(false);
            }}>
              {it.place_name}
            </button>
          ))}
          {!loading && items.length === 0 && (
            <div className="px-2 py-1 text-xs text-muted-foreground">Aucun résultat</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default MapboxAddressInput;

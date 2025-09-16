import React, { useRef } from 'react';
import { Button } from './button';
import { Input } from './input';

interface Props {
  value?: string[];
  onChange?: (files: string[]) => void;
}

// Simple zone: accepte drag&drop fichiers (stockés en object URL) + ajout URL manuelle
export const FileAttachmentZone: React.FC<Props> = ({ value = [], onChange }) => {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const update = (arr:string[]) => onChange?.(arr);
  const onFiles = (files: FileList | null) => {
    if(!files) return; const urls: string[] = [];
    Array.from(files).forEach(f=>{ urls.push(URL.createObjectURL(f)); });
    update([...(value||[]), ...urls]);
  };
  return (
    <div className="space-y-3">
      <div
        className="border border-dashed border-white/20 rounded-md p-4 text-center text-xs text-muted-foreground cursor-pointer hover:border-cyan-400 transition"
        onClick={()=>inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();}}
        onDrop={e=>{e.preventDefault(); onFiles(e.dataTransfer.files);}}
      >
        Glissez-déposez des fichiers ou cliquez pour sélectionner
        <input ref={inputRef} type="file" multiple hidden onChange={e=>onFiles(e.target.files)} />
      </div>
      <div className="flex gap-2 items-center">
        <Input placeholder="https://url-de-piece" onKeyDown={e=>{ if(e.key==='Enter'){ const v=(e.target as HTMLInputElement).value.trim(); if(v){ update([...(value||[]), v]); (e.target as HTMLInputElement).value=''; } } }} />
        <Button type="button" variant="outline" size="sm" onClick={()=>{ const v=(inputRef.current as any)?.previousSibling?.value; }}>Ajouter URL</Button>
      </div>
      {value.length>0 && <ul className="text-[11px] space-y-1 max-h-32 overflow-y-auto">
        {value.map((v,i)=>(
          <li key={i} className="flex items-center gap-2 bg-background/40 border border-white/10 px-2 py-1 rounded">
            <span className="truncate flex-1" title={v}>{v.startsWith('blob:')?'Fichier local':v}</span>
            <button type="button" className="text-rose-400 hover:text-rose-300 text-xs" onClick={()=>{ const copy=[...value]; copy.splice(i,1); update(copy); }}>✕</button>
          </li>
        ))}
      </ul>}
    </div>
  );
};

// Shim temporaire pour supprimer l'erreur d'import manquante.
// TODO: Implémenter la vraie logique d'upload (drag & drop, validation, etc.).
import * as React from 'react';

interface FileUploadButtonProps {
  onFiles?: (files: FileList) => void;
  onFileUploaded?: (url: string, name: string) => void; // compat shim
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFiles, onFileUploaded, disabled }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="px-2 py-1 text-xs rounded border bg-muted hover:bg-muted/70 disabled:opacity-50"
      >
        Fichier
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e)=>{ 
          if(e.target.files){
            onFiles?.(e.target.files);
            const f = e.target.files[0];
            if(f && onFileUploaded){
              // Pas d'upload réel ici – renvoie un blob URL temporaire
              onFileUploaded(URL.createObjectURL(f), f.name);
            }
          }
        }}
      />
    </div>
  );
};

export default FileUploadButton;
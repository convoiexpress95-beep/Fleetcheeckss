import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, X, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadButtonProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  disabled?: boolean;
}

const FileUploadButton = ({ onFileUploaded, disabled }: FileUploadButtonProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 10 MB",
          variant: "destructive",
        });
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non autorisé",
          description: "Types autorisés: Images, PDF, Word, texte",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl, selectedFile.name);
      setSelectedFile(null);
      
      toast({
        title: "Fichier téléchargé",
        description: "Le fichier a été joint avec succès",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      {selectedFile ? (
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <File className="w-4 h-4" />
          <span className="text-sm truncate max-w-32">{selectedFile.name}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="h-6 px-2"
          >
            {uploading ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-8 px-2"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default FileUploadButton;
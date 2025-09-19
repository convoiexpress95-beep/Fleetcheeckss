import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  FileText, 
  CheckCircle,
  Loader2,
  Upload,
  Camera,
  Building,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ConvoyeurProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConvoyeurProfileForm = ({ isOpen, onClose }: ConvoyeurProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingSiret, setIsVerifyingSiret] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    drivingLicense: "",
    experience: "",
    vehicleTypes: "",
    motivation: "",
    siret: "",
    companyName: "",
    avatar: null as File | null,
    kbisFile: null as File | null,
    permisFile: null as File | null,
    attestationVigilanceFile: null as File | null,
    attestationWGarageFile: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [documentPreviews, setDocumentPreviews] = useState({
    kbis: null as string | null,
    permis: null as string | null,
    attestationVigilance: null as string | null,
    attestationWGarage: null as string | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (type: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({
          ...prev,
          [type]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const verifySiret = async () => {
    if (!formData.siret || formData.siret.length !== 14) {
      toast.error("Le SIRET doit contenir 14 chiffres");
      return;
    }

    setIsVerifyingSiret(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-siret', {
        body: { siret: formData.siret }
      });

      if (error) {
        toast.error("Erreur lors de la vérification du SIRET");
        return;
      }

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          companyName: data.company.denomination || data.company.nom || "",
          address: data.company.adresse || ""
        }));
        toast.success("Informations entreprise récupérées avec succès !");
      } else {
        toast.error("SIRET non trouvé ou invalide");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification du SIRET");
    } finally {
      setIsVerifyingSiret(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        toast.error("Utilisateur non authentifié");
        return;
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (formData.avatar) {
        const avatarPath = `${userId}/avatar-${Date.now()}.${formData.avatar.name.split('.').pop()}`;
        await uploadFile(formData.avatar, 'avatars', avatarPath);
        avatarUrl = `avatars/${avatarPath}`;
        
        // Update profile with avatar
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('user_id', userId);
      }

      // Upload documents
      const documentUrls: Record<string, string | null> = {
        kbis: null,
        permis: null,
        attestationVigilance: null,
        attestationWGarage: null
      };

      for (const [type, file] of Object.entries({
        kbis: formData.kbisFile,
        permis: formData.permisFile,
        attestationVigilance: formData.attestationVigilanceFile,
        attestationWGarage: formData.attestationWGarageFile
      })) {
        if (file) {
          const docPath = `${userId}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
          await uploadFile(file, 'documents', docPath);
          documentUrls[type] = `documents/${docPath}`;
        }
      }

      // Submit application via database function
      const { data, error } = await supabase.rpc('submit_convoyeur_application', {
        _driving_license: formData.drivingLicense,
        _driving_experience: parseInt(formData.experience) || 0,
        _vehicle_types: formData.vehicleTypes,
        _siret: formData.siret || null,
        _company_name: formData.companyName || null,
        _motivation: formData.motivation || null,
        _kbis_url: documentUrls.kbis,
        _license_url: documentUrls.permis,
        _vigilance_url: documentUrls.attestationVigilance,
        _garage_url: documentUrls.attestationWGarage
      });

      if (error) {
        console.error('Error submitting application:', error);
        toast.error("Erreur lors de l'envoi de la candidature");
        return;
      }

      toast.success("Votre candidature a été soumise avec succès! Nous vous contacterons sous 24h.");
      onClose();
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        drivingLicense: "",
        experience: "",
        vehicleTypes: "",
        motivation: "",
        siret: "",
        companyName: "",
        avatar: null,
        kbisFile: null,
        permisFile: null,
        attestationVigilanceFile: null,
        attestationWGarageFile: null
      });
      setAvatarPreview(null);
      setDocumentPreviews({
        kbis: null,
        permis: null,
        attestationVigilance: null,
        attestationWGarage: null
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Erreur lors de l'envoi de la candidature");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Vérification de Profil Convoyeur
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complétez ce formulaire pour rejoindre notre réseau d'élite de convoyeurs professionnels
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback>
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Upload className="w-3 h-3 text-white" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2 font-semibold">
                <User className="w-4 h-4 text-primary" />
                Prénom
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                required
                className="bg-background/50 border-border hover:border-primary focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2 font-semibold">
                <User className="w-4 h-4 text-primary" />
                Nom
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Votre nom"
                required
                className="bg-background/50 border-border hover:border-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-semibold">
                <Mail className="w-4 h-4 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@exemple.com"
                required
                className="bg-background/50 border-border hover:border-primary focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 font-semibold">
                <Phone className="w-4 h-4 text-primary" />
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
                required
                className="bg-background/50 border-border hover:border-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="space-y-4 p-4 border border-border/50 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Informations Entreprise
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="siret" className="flex items-center gap-2 font-semibold">
                <Building className="w-4 h-4 text-primary" />
                SIRET
              </Label>
              <div className="flex gap-2">
                <Input
                  id="siret"
                  name="siret"
                  value={formData.siret}
                  onChange={handleInputChange}
                  placeholder="14 chiffres du SIRET"
                  maxLength={14}
                  className="bg-background/50 border-border hover:border-primary focus:border-primary flex-1"
                />
                <Button
                  type="button"
                  onClick={verifySiret}
                  disabled={isVerifyingSiret || formData.siret.length !== 14}
                  className="bg-gradient-premium hover:bg-gradient-premium"
                >
                  {isVerifyingSiret ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2 font-semibold">
                <Building className="w-4 h-4 text-primary" />
                Nom de l'entreprise
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Nom de votre entreprise"
                className="bg-background/50 border-border hover:border-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 font-semibold">
              <MapPin className="w-4 h-4 text-primary" />
              Adresse complète
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Rue de la République, 75001 Paris"
              required
              className="bg-background/50 border-border hover:border-primary focus:border-primary"
            />
          </div>

          {/* Permis de conduire */}
          <div className="space-y-2">
            <Label htmlFor="drivingLicense" className="flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4 text-primary" />
              Numéro de permis de conduire
            </Label>
            <Input
              id="drivingLicense"
              name="drivingLicense"
              value={formData.drivingLicense}
              onChange={handleInputChange}
              placeholder="123456789012"
              required
              className="bg-background/50 border-border hover:border-primary focus:border-primary"
            />
          </div>

          {/* Expérience */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-primary" />
              Années d'expérience en conduite
            </Label>
            <Input
              id="experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="5"
              required
              className="bg-background/50 border-border hover:border-primary focus:border-primary"
            />
          </div>

          {/* Types de véhicules */}
          <div className="space-y-2">
            <Label htmlFor="vehicleTypes" className="flex items-center gap-2 font-semibold">
              <Car className="w-4 h-4 text-primary" />
              Types de véhicules que vous pouvez conduire
            </Label>
            <Input
              id="vehicleTypes"
              name="vehicleTypes"
              value={formData.vehicleTypes}
              onChange={handleInputChange}
              placeholder="Voitures, Motos, Camions, Camping-cars..."
              required
              className="bg-background/50 border-border hover:border-primary focus:border-primary"
            />
          </div>

          {/* Documents requis */}
          <div className="space-y-4 p-4 border border-border/50 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents Requis
            </h3>
            
            {[
              { key: 'kbis', label: 'KBIS', required: true },
              { key: 'permis', label: 'Permis de conduire', required: true },
              { key: 'attestationVigilance', label: 'Attestation de vigilance fiscale', required: true },
              { key: 'attestationWGarage', label: 'Attestation W garage', required: false }
            ].map(({ key, label, required }) => (
              <div key={key} className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold">
                  <FileText className="w-4 h-4 text-primary" />
                  {label} {required && <span className="text-destructive">*</span>}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentChange(key, e.target.files?.[0] || null)}
                    className="bg-background/50 border-border hover:border-primary focus:border-primary"
                    required={required}
                  />
                  {documentPreviews[key as keyof typeof documentPreviews] && (
                    <div className="text-sm text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Téléchargé
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Motivation */}
          <div className="space-y-2">
            <Label htmlFor="motivation" className="flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4 text-primary" />
              Motivation (optionnel)
            </Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              placeholder="Dites-nous pourquoi vous souhaitez devenir convoyeur..."
              className="bg-background/50 border-border hover:border-primary focus:border-primary min-h-[100px]"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-premium hover:bg-gradient-premium hover:scale-105 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Soumettre ma candidature
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvoyeurProfileForm;
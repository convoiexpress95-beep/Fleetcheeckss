import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Euro, Send, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_propose?: number;
  description?: string;
}

interface DevisSubmissionProps {
  mission: Mission;
  onDevisSubmitted: () => void;
  existingDevis?: {
    id: string;
    prix_propose: number;
    message: string;
    statut: string;
  };
}

const DevisSubmission = ({ mission, onDevisSubmitted, existingDevis }: DevisSubmissionProps) => {
  const [formData, setFormData] = useState({
    price: existingDevis?.prix_propose || mission.prix_propose || '',
    message: existingDevis?.message || '',
    contestReason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContestDialog, setShowContestDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmitDevis = async () => {
    const priceValue = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    
    if (!priceValue || priceValue < 50) {
      toast({
        title: "Prix invalide",
        description: "Le prix doit être supérieur ou égal à 50€",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Message requis",
        description: "Veuillez ajouter un message pour accompagner votre devis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      if (existingDevis) {
        const { error } = await supabase
          .from('marketplace_devis')
          .update({
            prix_propose: priceValue,
            message: formData.message,
            statut: 'envoye'
          })
          .eq('id', existingDevis.id);

        if (error) throw error;

        toast({
          title: "Devis mis à jour",
          description: "Votre devis a été mis à jour avec succès",
        });
      } else {
        // Vérifier s'il existe déjà un devis pour cette mission et ce convoyeur
        const { data: existingDevis, error: checkError } = await supabase
          .from('marketplace_devis')
          .select('id')
          .eq('mission_id', mission.id)
          .eq('convoyeur_id', userData.user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingDevis) {
          // Mettre à jour le devis existant
          const { error } = await supabase
            .from('marketplace_devis')
            .update({
              prix_propose: priceValue,
              message: formData.message,
              statut: 'envoye',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingDevis.id);

          if (error) throw error;

          toast({
            title: "Devis mis à jour",
            description: "Votre devis a été mis à jour avec succès",
          });
        } else {
          // Créer un nouveau devis
          const { error } = await supabase
            .from('marketplace_devis')
            .insert({
              mission_id: mission.id,
              convoyeur_id: userData.user.id,
              prix_propose: priceValue,
              message: formData.message,
              statut: 'envoye'
            });

          if (error) throw error;

          toast({
            title: "Devis envoyé",
            description: "Votre devis a été envoyé avec succès",
          });
        }
      }

      onDevisSubmitted();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du devis:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le devis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContestPrice = async () => {
    const priceValue = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    
    if (!formData.contestReason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez indiquer la raison de votre contestation",
        variant: "destructive",
      });
      return;
    }

    if (!priceValue || priceValue < 50) {
      toast({
        title: "Prix invalide",
        description: "Veuillez proposer un prix supérieur ou égal à 50€",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      // Créer un devis avec contestation
      const { error } = await supabase
        .from('marketplace_devis')
        .insert({
          mission_id: mission.id,
          convoyeur_id: userData.user.id,
          prix_propose: priceValue,
          message: formData.message,
          statut: 'envoye',
          contested_at: new Date().toISOString(),
          contest_reason: formData.contestReason,
          original_price: mission.prix_propose,
          counter_offer: priceValue,
          response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
        });

      if (error) throw error;

      toast({
        title: "Contestation envoyée",
        description: "Votre contestation de prix a été envoyée au donneur d'ordre",
      });

      setShowContestDialog(false);
      onDevisSubmitted();
    } catch (error: any) {
      console.error('Erreur lors de la contestation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la contestation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingDevis ? 'Modifier votre devis' : 'Soumettre un devis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">{mission.titre}</h3>
          <p className="text-sm text-muted-foreground">
            {mission.ville_depart} → {mission.ville_arrivee}
          </p>
          {mission.prix_propose && (
            <p className="text-sm mt-2">
              <span className="font-medium">Prix proposé par le client:</span> {mission.prix_propose}€
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="price">Votre prix (€) *</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="50"
                step="0.01"
                placeholder="Ex: 150"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Prix minimum: 50€
            </p>
          </div>

          <div>
            <Label htmlFor="message">Message d'accompagnement *</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre expérience, vos garanties, pourquoi choisir vos services..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitDevis}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Envoi...' : (existingDevis ? 'Mettre à jour' : 'Envoyer le devis')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevisSubmission;
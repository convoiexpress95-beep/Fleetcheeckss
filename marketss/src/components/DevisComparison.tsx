import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Euro, MessageCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Devis {
  id: string;
  convoyeur_id: string;
  prix_propose: number;
  message: string;
  statut: string;
  created_at: string;
  contested_at?: string;
  contest_reason?: string;
  counter_offer?: number;
  response_deadline?: string;
  profiles?: {
    full_name: string;
    email: string;
    is_verified: boolean;
    avatar_url?: string;
    phone?: string;
    verification_notes?: string;
  } | null;
}

interface DevisComparisonProps {
  missionId: string;
  isOwner: boolean;
}

const DevisComparison = ({ missionId, isOwner }: DevisComparisonProps) => {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevis();
  }, [missionId]);

  const fetchDevis = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_devis')
        .select(`
          *,
          profiles!convoyeur_id (
            full_name,
            email,
            is_verified,
            avatar_url,
            phone,
            verification_notes
          )
        `)
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevis((data as any) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDevis = async (devisId: string, convoyeurId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_devis')
        .update({ statut: 'accepte' })
        .eq('id', devisId);

      if (error) throw error;

      // Refuser les autres devis
      await supabase
        .from('marketplace_devis')
        .update({ statut: 'refuse' })
        .eq('mission_id', missionId)
        .neq('id', devisId);

      // Créer une notification pour le convoyeur
      await supabase
        .from('notifications')
        .insert({
          user_id: convoyeurId,
          title: 'Devis accepté !',
          message: 'Félicitations ! Votre devis a été accepté. Vous pouvez maintenant échanger avec le donneur d\'ordre.',
          type: 'success'
        });

      await fetchDevis();
      toast({
        title: "Devis accepté",
        description: "Le devis a été accepté et les autres ont été refusés",
      });
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter le devis",
        variant: "destructive",
      });
    }
  };

  const handleRejectDevis = async (devisId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_devis')
        .update({ statut: 'refuse' })
        .eq('id', devisId);

      if (error) throw error;

      await fetchDevis();
      toast({
        title: "Devis refusé",
        description: "Le devis a été refusé",
      });
    } catch (error) {
      console.error('Erreur lors du refus du devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser le devis",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (statut: string, contested_at?: string) => {
    if (contested_at) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Contesté</Badge>;
    }
    
    switch (statut) {
      case 'envoye':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
      case 'accepte':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Accepté</Badge>;
      case 'refuse':
        return <Badge variant="outline" className="gap-1"><XCircle className="w-3 h-3" />Refusé</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const sortedDevis = [...devis].sort((a, b) => {
    // Prioriser les devis acceptés
    if (a.statut === 'accepte' && b.statut !== 'accepte') return -1;
    if (b.statut === 'accepte' && a.statut !== 'accepte') return 1;
    
    // Puis par prix (croissant)
    return a.prix_propose - b.prix_propose;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devis reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Devis reçus ({devis.length})</span>
          <div className="text-sm text-muted-foreground">
            {devis.filter(d => d.statut === 'envoye').length} en attente
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDevis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun devis reçu pour le moment</p>
          </div>
        ) : (
          sortedDevis.map((devisItem) => (
            <div
              key={devisItem.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                devisItem.statut === 'accepte' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 
                devisItem.contested_at ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {devisItem.profiles?.avatar_url && (
                      <AvatarImage src={devisItem.profiles.avatar_url} alt={devisItem.profiles?.full_name || 'Avatar'} />
                    )}
                    <AvatarFallback className="bg-primary/10">
                      {devisItem.profiles?.full_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{devisItem.profiles?.full_name || 'Convoyeur'}</p>
                      {devisItem.profiles?.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">✓ Vérifié</Badge>
                      )}
                    </div>
                    {devisItem.profiles?.phone && (
                      <p className="text-sm text-muted-foreground">📞 {devisItem.profiles.phone}</p>
                    )}
                    {devisItem.profiles?.verification_notes && (
                      <p className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded mt-1">
                        🎖️ {devisItem.profiles.verification_notes}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(devisItem.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(devisItem.statut, devisItem.contested_at)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {devisItem.prix_propose}€
                  </span>
                  {devisItem.counter_offer && (
                    <span className="text-sm text-muted-foreground">
                      (Contre-offre: {devisItem.counter_offer}€)
                    </span>
                  )}
                </div>

                {devisItem.message && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{devisItem.message}</p>
                  </div>
                )}

                {devisItem.contested_at && devisItem.contest_reason && (
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Contestation:
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">{devisItem.contest_reason}</p>
                  </div>
                )}

                {isOwner && devisItem.statut === 'envoye' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptDevis(devisItem.id, devisItem.convoyeur_id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accepter ce prestataire
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectDevis(devisItem.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Refuser
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Discuter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DevisComparison;
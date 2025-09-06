import React from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [docs, setDocs] = React.useState<any[]>([]);
  const [gallery, setGallery] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const enableReviews = import.meta.env.VITE_ENABLE_REVIEWS === '1';
        const enableVerificationDocs = import.meta.env.VITE_ENABLE_VERIFICATION_DOCS === '1';

        const profilePromise = supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        const reviewsPromise = enableReviews
          ? supabase.from('reviews').select('*').eq('target_user_id', id).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] } as any);
        const docsPromise = enableVerificationDocs
          ? supabase.from('verification_documents').select('*').eq('user_id', id).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] } as any);

        const [{ data: p }, { data: r }, { data: d }] = await Promise.all([
          profilePromise,
          reviewsPromise,
          docsPromise,
        ]);
        setProfile(p || null);
        setReviews(r || []);
        setDocs(d || []);

        // Galerie (public). Ignorer silencieusement en cas d'erreur.
        const { data: files } = await supabase.storage.from('profile-gallery').list(`users/${id}`, { limit: 100 });
        setGallery((files || []).map((f) => supabase.storage.from('profile-gallery').getPublicUrl(`users/${id}/${f.name}`).data.publicUrl));
      } catch (e) {
        // Ne rien faire, afficher le minimum du profil
      }
    })();
  }, [id]);

  const uploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !id || user.id !== id) return;
    const path = `users/${user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('profile-gallery').upload(path, file);
    if (!upErr) {
      const url = supabase.storage.from('profile-gallery').getPublicUrl(path).data.publicUrl;
      setGallery((g) => [url, ...g]);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Profil</h1>
          {profile?.is_verified && <span className="text-sm text-green-600">Vérifié</span>}
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div>Nom: {profile?.full_name || '-'}</div>
            <div>Entreprise: {profile?.company_name || '-'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold">Galerie véhicule</div>
            {user?.id === id && (
              <div className="flex items-center gap-2">
                <Input type="file" onChange={uploadDoc} />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((src) => (
                <img key={src} src={src} alt="vehicule" className="w-full h-32 object-cover rounded" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold">Documents de vérification</div>
            <ul className="list-disc pl-5 text-sm">
              {docs.map((d) => (
                <li key={d.id}>{d.doc_type} — {new Date(d.created_at).toLocaleDateString()}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold">Avis</div>
            <ul className="space-y-2">
              {reviews.map((r) => (
                <li key={r.id} className="text-sm">
                  Note: {r.rating}/5 — {r.comment || ''}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

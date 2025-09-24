import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let redirected = false;
    const to = '/dashboard';

    const go = () => {
      if (!redirected) {
        redirected = true;
        navigate(to, { replace: true });
      }
    };

    // If session is already present, navigate immediately
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) go();
    });

    // Listen for sign-in event (in case the session is stored on this page load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        go();
      }
    });

    // Fallback after a short delay
    const t = setTimeout(go, 1500);

    return () => {
      clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [navigate, location.search, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Connexion en cours…</p>
      </div>
    </div>
  );
};

export default AuthCallback;

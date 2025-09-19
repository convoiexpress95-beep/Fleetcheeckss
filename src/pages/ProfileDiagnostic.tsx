import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function ProfileDiagnostic() {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    if (!user) {
      setResults([{ test: 'Auth', status: 'error', message: 'Utilisateur non connecté' }]);
      return;
    }

    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    try {
      // Test 1: Vérifier l'accès en lecture aux profils
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .limit(1);

        if (error) {
          diagnostics.push({
            test: 'Lecture Profils',
            status: 'error',
            message: `Erreur RLS SELECT: ${error.message}`,
            details: error
          });
        } else {
          diagnostics.push({
            test: 'Lecture Profils',
            status: 'success',
            message: `Accès en lecture OK (${data.length} profils lisibles)`
          });
        }
      } catch (err: any) {
        diagnostics.push({
          test: 'Lecture Profils',
          status: 'error',
          message: `Exception: ${err.message}`
        });
      }

      // Test 2: Tester le ProfileService AVANT de vérifier l'existence
      // Cela garantit qu'un profil existe pour les tests suivants
      try {
        const success = await ProfileService.safeUpsertProfile({
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User'
        });

        if (success) {
          diagnostics.push({
            test: 'ProfileService Upsert',
            status: 'success',
            message: 'ProfileService.safeUpsertProfile fonctionne'
          });
        } else {
          diagnostics.push({
            test: 'ProfileService Upsert',
            status: 'error',
            message: 'ProfileService.safeUpsertProfile a échoué'
          });
        }
      } catch (err: any) {
        diagnostics.push({
          test: 'ProfileService Upsert',
          status: 'error',
          message: `Exception ProfileService: ${err.message}`
        });
      }

      // Test 3: Vérifier l'existence du profil utilisateur (après création)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          diagnostics.push({
            test: 'Profil Utilisateur',
            status: 'warning',
            message: `Erreur accès profil: ${error.message}`,
            details: error
          });
        } else if (!data) {
          diagnostics.push({
            test: 'Profil Utilisateur',
            status: 'warning',
            message: 'Profil utilisateur non trouvé (même après création via ProfileService)'
          });
        } else {
          diagnostics.push({
            test: 'Profil Utilisateur',
            status: 'success',
            message: `Profil trouvé: ${data.full_name || data.email}`,
            details: data
          });
        }
      } catch (err: any) {
        diagnostics.push({
          test: 'Profil Utilisateur',
          status: 'error',
          message: `Exception: ${err.message}`
        });
      }

      // Test 4: Tester mise à jour directe
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) {
          diagnostics.push({
            test: 'Mise à jour Directe',
            status: 'error',
            message: `Erreur RLS UPDATE: ${error.message}`,
            details: error
          });
        } else {
          diagnostics.push({
            test: 'Mise à jour Directe',
            status: 'success',
            message: 'Mise à jour directe autorisée par RLS'
          });
        }
      } catch (err: any) {
        diagnostics.push({
          test: 'Mise à jour Directe',
          status: 'error',
          message: `Exception: ${err.message}`
        });
      }

      // Test 5: Vérification finale - Le profil existe-t-il maintenant ?
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, full_name, created_at, updated_at')
          .eq('user_id', user.id)
          .single();

        if (error) {
          diagnostics.push({
            test: 'Vérification Finale',
            status: 'error',
            message: `Profil non accessible après tous les tests: ${error.message}`,
            details: error
          });
        } else {
          diagnostics.push({
            test: 'Vérification Finale',
            status: 'success',
            message: `✅ Profil persisté avec succès: ${data.full_name}`,
            details: {
              user_id: data.user_id,
              email: data.email,
              full_name: data.full_name,
              created_at: data.created_at,
              updated_at: data.updated_at
            }
          });
        }
      } catch (err: any) {
        diagnostics.push({
          test: 'Vérification Finale',
          status: 'error',
          message: `Exception vérification finale: ${err.message}`
        });
      }

    } catch (globalErr: any) {
      diagnostics.push({
        test: 'Global',
        status: 'error',
        message: `Erreur globale: ${globalErr.message}`
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-500/20 text-green-400',
      error: 'bg-red-500/20 text-red-400',
      warning: 'bg-yellow-500/20 text-yellow-400'
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Non connecté</h2>
            <p className="text-slate-400">Veuillez vous connecter pour accéder aux diagnostics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Diagnostic Profils</CardTitle>
                <p className="text-slate-400 mt-2">
                  Vérification des corrections 406/409 pour les profils utilisateur
                </p>
              </div>
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-500 to-teal-500"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Relancer les tests
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{result.test}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-slate-300 text-sm">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-400 cursor-pointer">
                            Voir les détails
                          </summary>
                          <pre className="text-xs text-slate-400 mt-1 p-2 bg-slate-800/50 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {results.length === 0 && !isRunning && (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  Aucun test exécuté
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Informations Utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">ID Utilisateur</h4>
                <p className="text-sm text-slate-400 font-mono">{user.id}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Email</h4>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Nom complet</h4>
                <p className="text-sm text-slate-400">
                  {user.user_metadata?.full_name || 'Non défini'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Créé le</h4>
                <p className="text-sm text-slate-400">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
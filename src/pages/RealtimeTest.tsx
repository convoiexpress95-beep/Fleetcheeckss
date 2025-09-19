import { RealtimeDebugger } from '@/components/RealtimeDebugger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RealtimeTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">FleetCheck - Test Temps Réel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette page permet de tester et déboguer toutes les fonctionnalités temps réel de l'application.
            Tous les systèmes doivent être connectés et synchronisés avec Supabase.
          </p>
        </CardContent>
      </Card>
      
      <RealtimeDebugger />
    </div>
  );
}
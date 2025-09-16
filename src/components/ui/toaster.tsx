// Ancienne implémentation shadcn supprimée: l'affichage est désormais géré directement
// dans ToastProvider (src/hooks/use-toast.tsx). Ce composant devient un alias pratique.
import { ToastProvider } from '@/hooks';

export function Toaster({ children }: { children?: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

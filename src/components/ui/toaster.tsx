// Ancienne implémentation shadcn supprimée: l'affichage est désormais géré directement
// dans ToastProvider (src/hooks/use-toast.tsx). Ce composant devient un alias pratique.
import { ToastProvider } from '@/hooks';

export interface ToasterProps {
  children?: React.ReactNode;
}

export function Toaster({ children }: ToasterProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

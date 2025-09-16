// Shim temporaire pour migration: ré-export vers le point d'entrée central.
// À supprimer après remplacement global des imports '@/hooks/use-toast'.
export { useToast, ToastProvider } from '../index';
export type { ToastOptions, ToastVariant, ToastPromiseMessages } from '../index';

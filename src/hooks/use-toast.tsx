import * as React from 'react';
import { logEvent } from '@/lib/metrics';

// Toast system avancé avec:
// - id unique
// - durée configurable (par défaut 4000ms)
// - variants multiples (default, success, info, warning, destructive)
// - dismiss manuel
// - file limitée (max 4)
// - helper promise (toast.promise)
// - fermeture via bouton

export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

export interface ToastOptions {
  id?: string;
  title: string;
  description?: React.ReactNode; // élargi: accepte noeuds React
  variant?: ToastVariant;
  durationMs?: number; // override
  dismissible?: boolean;
}

interface InternalToast {
  id: string;
  title: string;
  description: React.ReactNode;
  variant: ToastVariant;
  durationMs: number;
  dismissible: boolean;
  createdAt: number;
}

export interface ToastPromiseMessages<T = any> {
  loading: ToastOptions | string;
  success: ((result: T) => ToastOptions | string) | (ToastOptions | string);
  error: ((err: any) => ToastOptions | string) | (ToastOptions | string);
}

export interface ToastContextValue {
  toast(opts: ToastOptions): string; // returns id
  dismiss(id: string): void;
  promise<T>(p: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T>;
}

const ToastContext = React.createContext<ToastContextValue>({
  toast: () => '',
  dismiss: () => {},
  promise: async <T,>(p: Promise<T>) => p,
});

const MAX_TOASTS = 4;
const DEFAULT_DURATION = 4000;

function makeId() { return Math.random().toString(36).slice(2, 10); }

const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-neutral-800 text-white',
  success: 'bg-emerald-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-neutral-900',
  destructive: 'bg-red-600 text-white',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = React.useState<InternalToast[]>([]);
  const timersRef = React.useRef<Record<string, any>>({});

  const scheduleRemoval = React.useCallback((id: string, delay: number) => {
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    timersRef.current[id] = setTimeout(() => {
      setMessages(m => m.filter(t => t.id !== id));
      delete timersRef.current[id];
    }, delay);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setMessages(m => m.filter(t => t.id !== id));
    if (timersRef.current[id]) { clearTimeout(timersRef.current[id]); delete timersRef.current[id]; }
  }, []);

  const toast = React.useCallback((opts: ToastOptions) => {
    const id = opts.id || makeId();
    setMessages(m => {
      const next: InternalToast[] = [
        ...m.filter(t => t.id !== id),
        {
          id,
            title: opts.title,
            description: opts.description ?? '',
            variant: opts.variant ?? 'default',
            durationMs: opts.durationMs ?? DEFAULT_DURATION,
            dismissible: opts.dismissible ?? true,
            createdAt: Date.now(),
        }
      ];
      return next.slice(-MAX_TOASTS);
    });
    scheduleRemoval(id, opts.durationMs ?? DEFAULT_DURATION);
    logEvent('toast.show', { id, variant: opts.variant ?? 'default' });
    return id;
  }, [scheduleRemoval]);

  const promise = React.useCallback(async <T,>(p: Promise<T>, messages: ToastPromiseMessages<T>) => {
    const parse = (x: any): ToastOptions => typeof x === 'string' ? { title: x } : x;
    const loadingId = toast(parse(messages.loading));
    try {
      const res = await p;
      dismiss(loadingId);
      toast(parse(typeof messages.success === 'function' ? messages.success(res) : messages.success));
      return res;
    } catch (err) {
      dismiss(loadingId);
      toast({ variant: 'destructive', ...parse(typeof messages.error === 'function' ? messages.error(err) : messages.error) });
      throw err;
    }
  }, [toast, dismiss]);

  React.useEffect(() => () => {
    Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, promise }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 w-72">
        {messages.sort((a,b) => a.createdAt - b.createdAt).map(m => (
          <div
            key={m.id}
            className={`group rounded-md px-4 py-2 shadow text-sm transition-all flex flex-col gap-1 ${variantClasses[m.variant]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold leading-snug">{m.title}</span>
              {m.dismissible && (
                <button
                  aria-label="Fermer"
                  className="opacity-70 hover:opacity-100 text-xs mt-0.5"
                  onClick={() => dismiss(m.id)}
                >×</button>
              )}
            </div>
            {m.description && (
              <div className="text-xs leading-snug opacity-90 whitespace-pre-wrap">{m.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() { return React.useContext(ToastContext); }

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type ToastKind = 'success' | 'info' | 'warning';
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2.5rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in flex items-start gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-lift"
            role="status"
          >
            <span className="mt-0.5 shrink-0">
              {t.kind === 'success' && <CheckCircle2 className="h-5 w-5 text-accent-600" />}
              {t.kind === 'info' && <Info className="h-5 w-5 text-brand-600" />}
              {t.kind === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            </span>
            <p className="flex-1 text-sm font-medium text-ink-800 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-ink-400 hover:text-ink-700 transition-colors"
              aria-label="Benachrichtigung schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

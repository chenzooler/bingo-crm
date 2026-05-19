"use client";
import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { ...toast, id }]);
    const duration = toast.duration ?? 4500;
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

const TYPE_META: Record<ToastType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CheckCircle2 className="size-5" />, color: "text-bingo-green-dark", bg: "bg-bingo-green/12 border-bingo-green/40" },
  error: { icon: <AlertCircle className="size-5" />, color: "text-status-red", bg: "bg-status-red-soft border-status-red/40" },
  info: { icon: <Info className="size-5" />, color: "text-status-blue", bg: "bg-status-blue-soft border-status-blue/40" },
  warning: { icon: <AlertTriangle className="size-5" />, color: "text-orange-700", bg: "bg-status-orange-soft border-status-orange/40" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const meta = TYPE_META[toast.type];
  return (
    <div className={cn("toast-in pointer-events-auto rounded-2xl border bingo-shadow-lg p-3 pr-4 flex items-start gap-3", meta.bg, meta.color)}>
      <div className="shrink-0">{meta.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-extrabold text-bingo-black">{toast.title}</div>
        {toast.description && <div className="text-[12px] text-bingo-charcoal mt-0.5 leading-relaxed">{toast.description}</div>}
      </div>
      <button onClick={onDismiss} className="size-6 rounded-md hover:bg-black/5 inline-flex items-center justify-center text-bingo-gray-500 shrink-0">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

"use client";

import {
  createContext, useContext, useState,
  useCallback, useEffect, type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warn";

interface Toast {
  id:      string;
  type:    ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast:   (msg: string, type?: ToastType, duration?: number) => void;
  success: (msg: string) => void;
  error:   (msg: string) => void;
  info:    (msg: string) => void;
  warn:    (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {}, success: () => {}, error: () => {}, info: () => {}, warn: () => {},
});

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />,
  error:   <XCircle      className="w-4 h-4 flex-shrink-0 mt-0.5" />,
  info:    <Info         className="w-4 h-4 flex-shrink-0 mt-0.5" />,
  warn:    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />,
};

const BG = {
  success: "bg-slate-900 dark:bg-slate-800 text-white border-white/10",
  error:   "bg-red-600 text-white border-white/10",
  info:    "bg-brand-600 text-white border-white/10",
  warn:    "bg-amber-500 text-white border-white/10",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className={cn("toast", BG[toast.type])}>
      {ICONS[toast.type]}
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(p => [...p.slice(-4), { id, type, message, duration }]);
  }, []);

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error   = useCallback((msg: string) => toast(msg, "error"),   [toast]);
  const info    = useCallback((msg: string) => toast(msg, "info"),    [toast]);
  const warn    = useCallback((msg: string) => toast(msg, "warn"),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warn }}>
      {children}
      {/* Portal */}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }

"use client";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-md animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Xato yuz berdi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Sahifani yuklashda muammo yuz berdi. Iltimos qayta urinib ko&apos;ring.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Qayta yuklash
          </button>
        </div>
      </body>
    </html>
  );
}

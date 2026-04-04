"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-120px)] flex items-center justify-center px-4">
        <div className="text-center animate-fade-up">
          <p className="text-8xl font-display font-bold text-brand-600 dark:text-brand-400 mb-2">404</p>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
            Sahifa topilmadi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            Siz qidirgan sahifa mavjud emas yoki o&apos;chirilgan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">Bosh sahifaga qaytish</Link>
            <Link href="/jobs" className="btn-secondary">Vakansiyalarni ko&apos;rish</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

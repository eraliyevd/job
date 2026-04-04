/* ================================================================== */
/*  PLAN DEFINITIONS — single source of truth                         */
/* ================================================================== */

export type PlanKey = "free" | "basic" | "standard" | "pro" | "business";

export interface PlanConfig {
  key:         PlanKey;
  name:        string;
  price:       number;          // so'm
  durationDays:number;          // plan validity
  jobLimit:    number;          // max active approved jobs (-1 = unlimited)
  topCredits:  number;          // TOP placement credits granted on activation
  badge?:      string;          // optional promo label
  color:       string;          // tailwind classes for card border
  highlight:   boolean;         // show as "most popular"
  features:    string[];
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    key:          "free",
    name:         "Bepul",
    price:        0,
    durationDays: 0,             // no expiry
    jobLimit:     1,
    topCredits:   0,
    color:        "border-slate-200 dark:border-dark-600",
    highlight:    false,
    features: [
      "1 ta faol vakansiya",
      "7 kun ko'rinish",
      "Asosiy statistika",
    ],
  },
  basic: {
    key:          "basic",
    name:         "Basic",
    price:        50_000,
    durationDays: 7,
    jobLimit:     1,
    topCredits:   0,
    color:        "border-blue-300 dark:border-blue-700",
    highlight:    false,
    features: [
      "1 ta faol vakansiya",
      "7 kun ko'rinish",
      "Asosiy statistika",
      "Ustuvor joylashuv",
    ],
  },
  standard: {
    key:          "standard",
    name:         "Standard",
    price:        150_000,
    durationDays: 30,
    jobLimit:     10,
    topCredits:   2,
    badge:        "Mashhur",
    color:        "border-brand-400 dark:border-brand-600",
    highlight:    true,
    features: [
      "10 ta faol vakansiya",
      "30 kun ko'rinish",
      "2 ta TOP e'lon",
      "Batafsil statistika",
      "Kompaniya logosi",
    ],
  },
  pro: {
    key:          "pro",
    name:         "Pro",
    price:        300_000,
    durationDays: 30,
    jobLimit:     30,
    topCredits:   5,
    badge:        "Eng yaxshi",
    color:        "border-purple-400 dark:border-purple-600",
    highlight:    false,
    features: [
      "30 ta faol vakansiya",
      "30 kun ko'rinish",
      "5 ta TOP e'lon",
      "Premium statistika",
      "Kompaniya sahifasi",
      "24/7 qo'llab-quvvatlash",
    ],
  },
  business: {
    key:          "business",
    name:         "Business",
    price:        500_000,
    durationDays: 30,
    jobLimit:     -1,            // unlimited
    topCredits:   10,
    badge:        "Korporativ",
    color:        "border-amber-400 dark:border-amber-600",
    highlight:    false,
    features: [
      "Cheksiz vakansiyalar",
      "30 kun ko'rinish",
      "10 ta TOP e'lon",
      "API integratsiya",
      "Shaxsiy menejer",
      "ATS integratsiya",
    ],
  },
};

export const PAID_PLANS: PlanConfig[] = ["basic", "standard", "pro", "business"].map(k => PLANS[k as PlanKey]);

export function getPlan(key: string): PlanConfig {
  return PLANS[key as PlanKey] ?? PLANS.free;
}

export function formatPrice(amount: number): string {
  if (amount === 0) return "Bepul";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} mln so'm`;
  return `${(amount / 1_000).toFixed(0)} ming so'm`;
}

/* Payment card for manual transfers */
export const PAYMENT_CARD = {
  number:   "8600 0000 0000 0001",
  bank:     "Uzcard",
  holder:   "IshBor LLC",
  note:     "To'lov izohi: to'lov uchun to'liq ism va telefon raqamingizni yozing",
};

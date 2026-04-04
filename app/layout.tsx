import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "IshBor — O'zbekistondagi ish portali",
    template: "%s | IshBor",
  },
  description: "O'zbekistondagi eng yaxshi ish portali. Minglab vakansiyalar va professional xodimlar.",
  keywords:    ["ish", "vakansiya", "ishga qabul", "Uzbekistan", "job", "career"],
  openGraph: {
    type: "website", locale: "uz_UZ",
    url: "https://ishbor.uz", siteName: "IshBor",
    title: "IshBor — O'zbekistondagi ish portali",
    description: "Minglab vakansiyalar orasidan o'zingizga mos ishni toping.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

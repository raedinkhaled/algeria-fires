import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

import { Providers, colorModeScript } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";

import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

// خط أحادي المسافة للإحداثيات والمعرّفات والاختصارات العلمية فقط (LTR).
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "حرائق جيجل — إعادة بناء بالبيانات المفتوحة",
    template: "%s · حرائق جيجل",
  },
  description:
    "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، يعيد بناء التسلسل من بيانات الأقمار الصناعية والطقس والمصادر المفتوحة.",
  applicationName: "حرائق جيجل",
  authors: [{ name: "منصة حرائق جيجل" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar-DZ"
      dir="rtl"
      className={`${ibmPlexSansArabic.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}

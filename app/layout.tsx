import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

import { Providers, colorModeScript } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  weight: ["300", "400", "500", "600", "700"],
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
  metadataBase: siteUrl,
  title: {
    default: "حرائق جيجل: إعادة بناء بالبيانات المفتوحة",
    template: "%s · حرائق جيجل",
  },
  description:
    "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، يعيد بناء التسلسل من بيانات الأقمار الصناعية والطقس والمصادر المفتوحة.",
  applicationName: "حرائق جيجل",
  authors: [{ name: "منصة حرائق جيجل" }],
  keywords: [
    "حرائق جيجل",
    "حرائق الجزائر 2026",
    "بيانات الأقمار الصناعية",
    "VIIRS",
    "Sentinel-2",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "/",
    siteName: "حرائق جيجل",
    title: "حرائق جيجل: إعادة بناء بالبيانات المفتوحة",
    description:
      "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، يعيد بناء التسلسل من بيانات الأقمار الصناعية والطقس والمصادر المفتوحة.",
  },
  twitter: {
    card: "summary",
    title: "حرائق جيجل: إعادة بناء بالبيانات المفتوحة",
    description:
      "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، مبني على بيانات مفتوحة.",
  },
  robots: { index: true, follow: true },
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
      data-scroll-behavior="smooth"
      className={`${ibmPlexSansArabic.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "حرائق جيجل",
              url: absoluteUrl("/"),
              inLanguage: "ar-DZ",
              description:
                "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، مبني على بيانات مفتوحة.",
            }).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Noto_Sans_Arabic } from "next/font/google";

import { Providers, colorModeScript } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";

import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic", "latin"],
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
      data-astryx-theme="jijel"
      className={`${notoSansArabic.variable} ${notoKufiArabic.variable}`}
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

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "حرائق جيجل: إعادة بناء بالبيانات المفتوحة",
    short_name: "حرائق جيجل",
    description:
      "تحليل توثيقي مستقل لحرائق ولاية جيجل في أوت 2026، مبني على بيانات مفتوحة.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf8",
    theme_color: "#26231f",
    lang: "ar-DZ",
    dir: "rtl",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

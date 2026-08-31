import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // يمنع next dev افتراضياً طلبات _next/* حين تُفتح المعاينة على 127.0.0.1
  // بدل localhost، فتفشل حزم العميل (Recharts والحركة) بصمت. نسمح بالمضيف المحلي.
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

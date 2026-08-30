import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // يمنع next dev افتراضياً طلبات _next/* حين تُفتح المعاينة على 127.0.0.1
  // بدل localhost، فتفشل حزم العميل (Recharts والحركة) بصمت. نسمح بالمضيف المحلي.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

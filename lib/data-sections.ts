/**
 * أقسام صفحة البيانات: مصدر واحد يغذّي فهرس الشريط الجانبي في الصفحة
 * الخادمة، ومعرّفات المراسي في مستكشف البيانات العميل.
 */
export const dataSections = [
  { id: "daily", index: "01", label: "النشاط اليومي" },
  { id: "origins", index: "02", label: "مرشحو المنشأ" },
  { id: "patches", index: "03", label: "الندبات الكبرى" },
  { id: "ignition-windows", index: "04", label: "نوافذ الاشتعال" },
  { id: "pairs", index: "05", label: "الأزواج المتقاربة" },
  { id: "figures", index: "06", label: "الخرائط والأشكال" },
  { id: "downloads", index: "07", label: "التنزيلات" },
] as const;

/**
 * أقسام صفحة البيانات: مصدر واحد يغذّي فهرس الشريط الجانبي في الصفحة
 * الخادمة، ومعرّفات المراسي في مستكشف البيانات العميل.
 */
export const dataSections = [
  { id: "daily", index: "01", label: "النشاط اليومي" },
  { id: "origins", index: "02", label: "مرشحو المنشأ" },
  { id: "patches", index: "03", label: "الندبات الكبرى" },
  { id: "downloads", index: "04", label: "التنزيلات" },
] as const;

/**
 * مصدر واحد لبيانات عرض طبقات الخريطة: يغذّي شريط الطبقات داخل المكوّن
 * التفاعلي، ودليل الطبقات في صفحة الخريطة. تبقى تفاصيل نمط MapLibre هنا
 * لأنها ثابتة مع الطبقة نفسها.
 */

export type MapLayerId =
  | "hotspots"
  | "origins"
  | "burn"
  | "severity"
  | "communes";

export type MapLayer = {
  id: MapLayerId;
  /** معرّف الطبقة في ملفَّي نمط MapLibre */
  styleId: string;
  label: string;
  /** الحقل الزمني الذي يخضع للترشيح التراكمي، إن وُجد */
  timeField?: string;
  /** العدد المرجعي كما يظهر في دليل الطبقات؛ يُترك فارغاً للطبقات المتصلة */
  count?: string;
  /** تعريف مختصر يظهر في الدليل وفي تلميح زر الطبقة */
  note: string;
};

export const mapLayers: readonly MapLayer[] = [
  {
    id: "hotspots",
    styleId: "hotspots",
    label: "الرصد الحراري",
    timeField: "datetime_local",
    count: "9,100",
    note: "قراءات من مستشعرات VIIRS وMODIS، حجم النقطة يتبع قوة الإشعاع الحراري.",
  },
  {
    id: "origins",
    styleId: "candidate-origins",
    label: "البدايات المحتملة",
    timeField: "first_local",
    count: "12",
    note: "مواقع اجتازت معاً شرط البُعد ≥5 كم عن أقرب حريق سابق وانقطاع المسار ≥4 كم.",
  },
  {
    id: "burn",
    styleId: "burn-patch-centroids",
    label: "مراكز الندبات",
    timeField: "first_det_local",
    count: "17",
    note: "مركز هندسي لكل ندبة حريق أكبر من 100 هكتار. لا حدود مضلّعة منشورة، ولم نختلقها.",
  },
  {
    id: "severity",
    styleId: "burn-severity",
    label: "شدة الاحتراق",
    note: "فرق الانعكاسية dNBR من Sentinel-2 بين 18 و28 أوت، من سطحية إلى شديدة.",
  },
  {
    id: "communes",
    styleId: "communes",
    label: "حدود البلديات",
    count: "28",
    note: "بلديات ولاية جيجل، للتوطين الإداري فقط.",
  },
];

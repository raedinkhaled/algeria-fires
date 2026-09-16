/**
 * مصدر واحد لأقسام الموقع: يغذّي التنقل العلوي، ودرج الهاتف، وفهرس
 * الصفحة الرئيسية. الترتيب هو ترتيب القراءة المقترح.
 */
export type SiteSection = {
  href: string;
  label: string;
  /** عنوان أطول للفهرس على الصفحة الرئيسية. */
  title: string;
  /** سطر واحد يشرح ما يقدّمه القسم. */
  summary: string;
};

export const siteSections: readonly SiteSection[] = [
  {
    href: "/chronology",
    label: "التسلسل الزمني",
    title: "ماذا حدث، يوماً بيوم",
    summary: "مسار الحدث من أول بؤرة إلى الانحسار، مع لحظات البداية المقيسة بدقة ربع ساعة.",
  },
  {
    href: "/investigation",
    label: "التحقيق",
    title: "كيف عرفنا أن السبب ليس طبيعياً؟",
    summary: "الأدلة خطوة بخطوة: أول إشارة، تعدّد البدايات، البرق، الطقس، ثم ما يبقى.",
  },
  {
    href: "/map",
    label: "الخريطة",
    title: "شاهد أين ومتى ظهرت الحرائق",
    summary: "خريطة للرصد الحراري والبدايات المحتملة والبلديات وشدة الاحتراق عبر الوقت.",
  },
  {
    href: "/data",
    label: "البيانات",
    title: "افحص الأرقام بنفسك",
    summary: "رسوم وجداول قابلة للتصفية، مع تنزيل البيانات المعالجة المستخدمة في التحقيق.",
  },
  {
    href: "/report",
    label: "التقرير",
    title: "التقرير العربي الكامل",
    summary: "كل فصول التحقيق والحسابات والجداول ودرجات الثقة في وثيقة واحدة.",
  },
  {
    href: "/methodology",
    label: "المنهجية",
    title: "كيف جُمعت البيانات وفُحصت؟",
    summary: "شرح طريقة العمل والمصطلحات العلمية وفجوات الرصد وكيف حددنا درجات الثقة.",
  },
  {
    href: "/sources",
    label: "المصادر",
    title: "راجع كل مصدر",
    summary: "الناشر والتاريخ والرابط ودور كل مصدر في التحقيق، مع حالة الوصول إليه.",
  },
] as const;

/** رقم الملف لكل قسم بحسب ترتيب القراءة: «01» للتسلسل الزمني وهكذا. */
export function sectionIndex(href: string): string {
  const position = siteSections.findIndex((section) => section.href === href);
  return position === -1 ? "00" : String(position + 1).padStart(2, "0");
}

/** رابط الصفحة الرئيسية (الملخص)، منفصل لأن الشعار يقود إليه. */
export const homeSection = { href: "/", label: "الملخص" } as const;

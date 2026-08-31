import { cn } from "@/lib/utils";

type MethodStage = {
  title: string;
  input: string;
  output: string;
  control: string;
  tone: "info" | "ok" | "warn" | "support";
};

const toneClasses: Record<MethodStage["tone"], string> = {
  info: "border-s-info text-info",
  ok: "border-s-ok text-ok",
  warn: "border-s-warn text-warn",
  support: "border-s-support text-support",
};

const stages: MethodStage[] = [
  {
    title: "تجميع الرصد",
    input: "FIRMS، Sentinel-2، METAR، Open-Meteo، DEM، OSM",
    output: "سجلات موحّدة زمنياً ومكانياً",
    control: "الاحتفاظ بالتوقيتين المحلي وUTC",
    tone: "info",
  },
  {
    title: "تنظيف الحرارة",
    input: "كل البكسلات الساخنة في النطاق الإقليمي",
    output: "رصد حريق محتمل بعد عزل المصدر الصناعي الثابت",
    control: "عدم تفسير المنشآت الحرارية كحرائق",
    tone: "warn",
  },
  {
    title: "اختزال التكرار",
    input: "رصد متكرر للبكسل نفسه عبر التمريرات",
    output: "4,451 خلية، أقدم رصد لكل خلية 375 م",
    control: "الرصد المتكرر لا يُعد موقعاً جديداً",
    tone: "info",
  },
  {
    title: "تحديد الأحداث",
    input: "المكان والوقت وعلاقات الجوار",
    output: "تجمعات حساسة للعتبات و12 مرشح منشأ",
    control: "24 تركيبة حساسية مع مقارنة DBSCAN",
    tone: "support",
  },
  {
    title: "اختبار البلوغ",
    input: "المسافة والزمن وفجوة المسار المحترق",
    output: "فصل الانتشار الممكن عن البداية المستقلة",
    control: "مسافة 5 كم وفجوة غير محترقة 4 كم معاً",
    tone: "warn",
  },
  {
    title: "قياس لحظة البداية",
    input: "أرشيف MSG/SEVIRI كل 15 دقيقة فوق مواقع المنشأ",
    output: "نافذة اشتعال بدورة رصد واحدة لست بؤر",
    control: "الشرائح المحجوبة بالسحب تبقى عمياء ولا تُقرّب الحدّ",
    tone: "info",
  },
  {
    title: "التحقق المستقل",
    input: "dNBR، التضاريس، الطقس، الطرق، البلاغات",
    output: "17 ندبة منفصلة ومطابقة متعددة المصادر",
    control: "فيزياء مختلفة ومصادر لا تعتمد على FIRMS",
    tone: "ok",
  },
  {
    title: "ضبط الجودة والنشر",
    input: "كل الجداول والحسابات والادعاءات",
    output: "بيانات معالجة وتقرير بدرجات ثقة معلنة",
    control: "إعادة حساب المسافات والتحقق من القيم المرجعية",
    tone: "ok",
  },
];

export function MethodologyDiagram() {
  return (
    <figure className="border bg-card">
      <div className="grid border-b bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)] md:gap-5">
        <span>التحويل</span>
        <span className="hidden md:block">المدخل ← المخرج</span>
        <span className="hidden md:block">حاجز الخطأ</span>
      </div>
      <ol className="divide-y">
        {stages.map((stage) => (
          <li
            key={stage.title}
            className={cn(
              "grid gap-3 border-s-[3px] px-4 py-4 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)] md:gap-5",
              toneClasses[stage.tone],
            )}
          >
            <h3 className="text-sm font-semibold text-foreground">
              {stage.title}
            </h3>
            <div className="text-sm leading-7 text-foreground">
              <p>{stage.input}</p>
              <p className="mt-1 text-muted-foreground">← {stage.output}</p>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              {stage.control}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="border-t px-4 py-3 text-xs leading-6 text-muted-foreground">
        كل انتقال ينتج مادة جديدة قابلة للفحص. لا تتحول «أقدم إشارة» إلى
        «سبب اشتعال» في أي مرحلة.
      </figcaption>
    </figure>
  );
}

import { cn } from "@/lib/utils";

type MethodStage = {
  title: string;
  input: string;
  output: string;
  control: string;
  tone: "info" | "ok" | "warn" | "support";
};

export const toneClasses: Record<MethodStage["tone"], string> = {
  info: "border-info text-info",
  ok: "border-ok text-ok",
  warn: "border-warn text-warn",
  support: "border-support text-support",
};

export const methodStages: MethodStage[] = [
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
    <figure className="data-figure">
      <div className="hidden border-y border-rule py-2.5 text-[11px] text-muted-foreground md:grid md:grid-cols-[3rem_minmax(0,11rem)_minmax(0,1fr)_minmax(0,14rem)] md:gap-6">
        <span aria-hidden="true" />
        <span>التحويل</span>
        <span>المدخل ← المخرج</span>
        <span>حاجز الخطأ</span>
      </div>
      <ol className="border-t border-rule md:border-t-0">
        {methodStages.map((stage, index) => (
          <li
            key={stage.title}
            className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-border py-6 md:grid-cols-[3rem_minmax(0,11rem)_minmax(0,1fr)_minmax(0,14rem)] md:gap-x-6"
          >
            <span
              aria-hidden="true"
              className={cn(
                "numeric row-span-3 flex size-9 items-center justify-center border-[1.5px] bg-background text-[12px] font-medium md:row-span-1",
                toneClasses[stage.tone],
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {index < methodStages.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute start-[1.125rem] top-[3.75rem] -bottom-6 w-px bg-border"
              />
            ) : null}
            <h3 className="text-[16px] font-semibold leading-7 text-foreground">
              {stage.title}
            </h3>
            <div className="text-[14.5px] leading-7 text-foreground">
              <p>{stage.input}</p>
              <p className="mt-1 text-muted-foreground">← {stage.output}</p>
            </div>
            <p className="border-s-2 border-border ps-3 text-xs leading-6 text-muted-foreground md:border-s-0 md:ps-0">
              {stage.control}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="grid gap-x-6 gap-y-1 pt-3 text-[13px] leading-7 text-muted-foreground sm:grid-cols-[4rem_minmax(0,1fr)]">
        <span className="text-[11px] font-medium leading-7 text-foreground">
          شكل <span className="numeric figure-index" />
        </span>
        <span>
          كل انتقال ينتج مادة جديدة قابلة للفحص. لا تتحول «أقدم إشارة» إلى
          «سبب اشتعال» في أي مرحلة.
        </span>
      </figcaption>
    </figure>
  );
}

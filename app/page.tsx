import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CircleAlertIcon } from "lucide-react";

import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { siteSections } from "@/lib/site-navigation";

const keyFigures = [
  { value: "9,100", label: "رصد حراري", description: "قراءات صالحة بعد التنظيف والتحقق." },
  { value: "4,451", label: "خلية مكانية", description: "شبكة بدقة 375 م لتتبع الحركة." },
  { value: "12", label: "بداية محتملة", description: "مواقع اجتازت شروط المسافة والانفصال." },
  { value: "17", label: "منطقة محترقة كبيرة", description: "كل واحدة تتجاوز 100 هكتار." },
];

const timeline = [
  { date: "23 أوت", title: "أول إشارة في المنطقة الأوسع", body: "ظهر رصد حراري عند 01:35 في ولاية سطيف، خارج جيجل." },
  { date: "24 أوت", title: "أول إشارة داخل جيجل", body: "سجّل القمر نقطة ساخنة عند 14:53 في الجمعة بني حبيبي." },
  { date: "26–27 أوت", title: "انتشار سريع تحت طقس قاسٍ", body: "ارتفع النشاط مع حرارة وصلت إلى 43°م ورطوبة هبطت إلى 12.5٪." },
  { date: "28–29 أوت", title: "ظهرت آثار الحرائق بوضوح", body: "كشفت صور Sentinel-2 مناطق محترقة منفصلة، وبدأ التحقيق الرسمي في الأسباب." },
];

const findings = [
  {
    value: "origins",
    question: "هل كان حريقاً واحداً؟",
    answer: "على الأرجح لا. البيانات تشير إلى بدايات منفصلة.",
    evidence: "تظهر 12 بداية محتملة، وتفصل بينها مسافات وأراضٍ لم تحترق. وتؤكد صور Sentinel-2 وجود 17 منطقة محترقة كبيرة منفصلة.",
    limit: "لا تعني كل نقطة بداية حريقاً مستقلاً مؤكداً؛ إنها أفضل المواقع التي اجتازت شروط التحليل.",
    confidence: "الثقة: عالية",
    sources: "DS-01–05 · OF-06",
  },
  {
    value: "weather",
    question: "لماذا انتشرت النار بهذه السرعة؟",
    answer: "الحرارة والجفاف والرياح تفسر سرعة الانتشار.",
    evidence: "وصلت موجة السيروكو إلى ذروتها في الوقت نفسه الذي قفز فيه النشاط الحراري: حرارة مرتفعة جداً، رطوبة شديدة الانخفاض، وهبات قوية.",
    limit: "الطقس يشرح كيف كبر الحريق، لكنه لا يخبرنا كيف بدأت الشرارة الأولى.",
    confidence: "الثقة: عالية",
    sources: "DS-07 · DS-08",
  },
  {
    value: "cause",
    question: "هل كانت البداية طبيعية؟",
    answer: "السبب المرتبط بنشاط بشري أرجح من البرق.",
    evidence: "لم تسجل بيانات الطقس برقاً أو أمطاراً تفسر البدايات الرئيسية في جيجل. لذلك يصبح السبب البشري، مثل حادث أو إهمال أو فعل متعمد، هو التفسير الأرجح.",
    limit: "هذا استنتاج بالاستبعاد، وليس دليلاً ميدانياً على سبب محدد.",
    confidence: "الثقة: متوسطة",
    sources: "DS-07 · DS-08 · ME-04",
  },
  {
    value: "intent",
    question: "هل تثبت البيانات أن الحرائق كانت متعمدة؟",
    answer: "لا. صور الأقمار لا تستطيع حسم النية أو المسؤولية.",
    evidence: "الرصد الحراري يحدد المكان والوقت التقريبي، لكنه لا يفرق بين حادث وإهمال وفعل متعمد. كما أن الأقمار لا تمر بشكل متواصل.",
    limit: "حسم النية يحتاج إلى تحقيق ميداني وأدلة قضائية، لا إلى صور الأقمار وحدها.",
    confidence: "الثقة: عالية في عدم القدرة على الحسم",
    sources: "الفصول 25–27 · OF-07",
  },
];

export default function Home() {
  return (
    <article>
      <header className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20">
        <StoryBreadcrumb current="الملخص" />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">ملف 01 / المراجعة 4</p>
            <p className="mt-2">ولاية جيجل، الجزائر</p>
            <p className="numeric mt-1">22–29.08.2026</p>
            <p className="ltr-embed mt-1">36.72°N · 5.95°E</p>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-sm font-medium">تحقيق مفتوح بالبيانات</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              كيف بدأت حرائق جيجل، وكيف انتشرت؟
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              جمعنا صور الأقمار وبيانات الطقس لنرتب ما حدث يوماً بيوم. النتيجة الأقوى: النار ظهرت في أكثر من مكان، والطقس القاسي سرّع انتشارها. أما سبب كل بداية، فلا تحسمه البيانات وحدها.
            </p>
          </div>
        </div>

        <figure className="mt-12 sm:mt-16">
          <div className="overflow-hidden border bg-muted">
            <Image src="/generated/media/sentinel-comparison.png" alt="صورتان من Sentinel-2 تقارنان الغطاء النباتي قبل حرائق جيجل وبعدها" width={2395} height={1494} priority className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-xs leading-5 text-muted-foreground">
            <span>قبل الحريق وبعده — الغطاء الداكن يوضح المناطق التي احترقت.</span>
            <span className="ltr-embed">Sentinel-2 · 19/28.08.2026</span>
          </figcaption>
        </figure>

        <Alert className="mt-8">
          <CircleAlertIcon />
          <AlertTitle>فرق مهم قبل القراءة</AlertTitle>
          <AlertDescription>أول رصد فضائي ليس لحظة الاشتعال. قد تبدأ النار قبل مرور القمر بساعات.</AlertDescription>
        </Alert>
      </header>

      <section className="border-y">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3"><p className="text-sm font-medium">حجم المادة التي راجعناها</p></div>
            <div className="lg:col-span-9">
              <ItemGroup className="grid gap-0 border-y sm:grid-cols-2 lg:grid-cols-4">
                {keyFigures.map((figure, index) => (
                  <Item key={figure.label} className="rounded-none border-b px-0 py-5 sm:px-5 lg:border-b-0 lg:border-s">
                    <ItemContent>
                      <ItemTitle className="line-clamp-none">{figure.label}</ItemTitle>
                      <ItemDescription className="line-clamp-none">{figure.description}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="numeric text-3xl font-semibold tracking-tight">{figure.value}</ItemActions>
                    <span className="numeric basis-full text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")} / 04</span>
                  </Item>
                ))}
              </ItemGroup>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
        <div className="lg:col-span-3">
          <p className="text-sm font-medium">ما الذي حدث؟</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">أربع محطات تختصر تسلسل الحدث.</p>
        </div>
        <div className="lg:col-span-8 lg:col-start-5">
          <ItemGroup>
            {timeline.map((event, index) => (
              <div key={event.title}>
                <Item className="rounded-none px-0 py-4">
                  <ItemMedia className="numeric w-20 justify-start text-sm font-medium">{event.date}</ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-none text-base">{event.title}</ItemTitle>
                    <ItemDescription className="line-clamp-none leading-7">{event.body}</ItemDescription>
                  </ItemContent>
                </Item>
                {index < timeline.length - 1 ? <ItemSeparator /> : null}
              </div>
            ))}
          </ItemGroup>
        </div>
      </section>

      <section className="border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium">النتيجة في أربعة أسئلة</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">افتح أي سؤال لرؤية الدليل وحدوده ومصادره.</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <Accordion type="single" collapsible defaultValue="origins">
              {findings.map((finding, index) => (
                <AccordionItem key={finding.value} value={finding.value}>
                  <AccordionTrigger className="py-5 text-base sm:text-lg">
                    <span className="flex gap-4">
                      <span className="numeric text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                      <span>{finding.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 ps-9">
                    <p className="text-base font-medium leading-7">{finding.answer}</p>
                    <p className="mt-4 leading-7 text-muted-foreground"><span className="font-medium text-foreground">الدليل: </span>{finding.evidence}</p>
                    <p className="mt-3 leading-7 text-muted-foreground"><span className="font-medium text-foreground">الحد: </span>{finding.limit}</p>
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      <span>{finding.confidence}</span>
                      <Link href="/sources" className="ltr-embed text-muted-foreground underline underline-offset-4 hover:text-foreground">{finding.sources}</Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
        <div className="lg:col-span-3"><p className="text-sm font-medium">أين نتوقف؟</p></div>
        <div className="lg:col-span-8 lg:col-start-5">
          <h2 className="max-w-3xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">نعرف أن النار بدأت في أكثر من مكان. لا نعرف من أشعل كل حريق، ولا إن كان متعمداً.</h2>
          <p className="mt-6 max-w-3xl leading-8 text-muted-foreground">هذا تحليل مستقل للبيانات المفتوحة، وليس تحقيقاً رسمياً. أي حكم على المسؤولية يحتاج إلى فحص ميداني وشهادات وأدلة قضائية.</p>
          <Alert className="mt-8">
            <AlertTitle>الخلاصة الدقيقة</AlertTitle>
            <AlertDescription>السبب المرتبط بنشاط بشري أرجح من البرق، لكن البيانات لا تفرق بين الحادث والإهمال والفعل المتعمد.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium">تابع القصة</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">ابدأ بالتحقيق المبسط، ثم ارجع إلى التقرير أو البيانات عند الحاجة.</p>
          </div>
          <nav aria-label="أقسام المنصة" className="lg:col-span-8 lg:col-start-5">
            <ItemGroup>
              {siteSections.map((section, index) => (
                <div key={section.href}>
                  <Item asChild className="rounded-none px-0 py-4">
                    <Link href={section.href}>
                      <ItemMedia className="numeric w-9 justify-start text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</ItemMedia>
                      <ItemContent>
                        <ItemTitle className="line-clamp-none text-base">{section.title}</ItemTitle>
                        <ItemDescription className="line-clamp-none leading-7">{section.summary}</ItemDescription>
                      </ItemContent>
                      <ItemActions><ArrowLeftIcon aria-hidden="true" /></ItemActions>
                    </Link>
                  </Item>
                  {index < siteSections.length - 1 ? <ItemSeparator /> : null}
                </div>
              ))}
            </ItemGroup>
          </nav>
        </div>
      </section>
    </article>
  );
}

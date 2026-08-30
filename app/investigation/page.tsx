import type { Metadata } from "next";
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
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "كيف وصلنا إلى النتيجة؟",
  description: "شرح بسيط للأدلة التي استخدمناها لفهم بدايات حرائق جيجل وانتشارها وحدود ما يمكن إثباته.",
};

const sections = [
  { id: "first-observation", number: "01", label: "أول إشارة" },
  { id: "multiple-origins", number: "02", label: "بدايات متعددة" },
  { id: "weather", number: "03", label: "سبب سرعة الانتشار" },
  { id: "terrain", number: "04", label: "الرياح والجبال" },
  { id: "hypotheses", number: "05", label: "اختبار التفسيرات" },
  { id: "limits", number: "06", label: "ما الذي لا نعرفه؟" },
];

function EvidenceDetails({ confidence, sources, children }: { confidence: string; sources: string; children: React.ReactNode }) {
  return (
    <Accordion type="single" collapsible className="mt-6 border-y">
      <AccordionItem value="evidence" className="border-0">
        <AccordionTrigger>لماذا نثق بهذه النتيجة؟</AccordionTrigger>
        <AccordionContent className="leading-7 text-muted-foreground">
          {children}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground">
            <span>درجة الثقة: {confidence}</span>
            <Link href="/sources" className="ltr-embed text-muted-foreground underline underline-offset-4 hover:text-foreground">{sources}</Link>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function InvestigationPage() {
  return (
    <article>
      <header className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20">
        <StoryBreadcrumb current="التحقيق" />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">طريقة القراءة</p>
            <p className="mt-2">6 محطات قصيرة</p>
            <p className="mt-1">المراجعة 4</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">كيف وصلنا إلى النتيجة؟</h1>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-muted-foreground">نبدأ بأول إشارة رآها القمر، ثم نختبر إن كانت النار قد انتشرت من مكان واحد أو بدأت في أماكن مختلفة. وفي النهاية نفصل بوضوح بين ما تثبته البيانات وما لا تستطيع إثباته.</p>
          </div>
        </div>

        <Separator className="my-10 sm:my-14" />

        <nav aria-label="فهرس التحقيق">
          <ItemGroup className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Item key={section.id} asChild className="rounded-none border-b px-0 py-3 sm:px-4">
                <Link href={`#${section.id}`}>
                  <ItemMedia className="numeric w-8 justify-start text-xs text-muted-foreground">{section.number}</ItemMedia>
                  <ItemContent><ItemTitle className="line-clamp-none">{section.label}</ItemTitle></ItemContent>
                  <ItemActions><ArrowLeftIcon aria-hidden="true" /></ItemActions>
                </Link>
              </Item>
            ))}
          </ItemGroup>
        </nav>
      </header>

      <section id="first-observation" className="scroll-mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">01 / 06</p><h2 className="mt-3 text-2xl font-semibold">أول إشارة</h2></div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">رأى القمر أول نقطة ساخنة داخل جيجل يوم 24 أوت عند 14:53 في الجمعة بني حبيبي.</p>
            <p className="mt-6 leading-8 text-muted-foreground">سجّلها مستشعر <span className="ltr-embed text-foreground">VIIRS</span> على القمر <span className="ltr-embed text-foreground">Suomi-NPP</span> عند <span className="ltr-embed text-foreground">36.78738°N, 6.11795°E</span>. أما أول إشارة في المنطقة الأوسع فظهرت قبلها بيوم في سطيف، خارج جيجل.</p>
            <Alert className="mt-8">
              <CircleAlertIcon />
              <AlertTitle>هذه ليست نقطة الاشتعال المؤكدة</AlertTitle>
              <AlertDescription>إنها أول مرة رأى فيها القمر حرارة الحريق. ربما بدأت النار قبل ذلك بساعات.</AlertDescription>
            </Alert>
            <EvidenceDetails confidence="عالية في الرصد" sources="DS-01 · ME-01 · ME-04">القيمة الأصلية تشمل وقت الرصد، الإحداثيات، وقوة الإشعاع الحراري. نحتفظ بها كما وردت في سجل المصدر، مع تحويل الوقت إلى التوقيت المحلي فقط.</EvidenceDetails>
          </div>
        </div>
      </section>

      <section id="multiple-origins" className="scroll-mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">02 / 06</p><h2 className="mt-3 text-2xl font-semibold">بدايات متعددة</h2></div>
          <div className="lg:col-span-9">
            <div className="grid gap-10 lg:grid-cols-9">
              <div className="lg:col-span-5">
                <p className="text-2xl font-medium leading-10">البيانات لا تشبه حريقاً واحداً تحرك من نقطة إلى أخرى. وجدنا 12 بداية محتملة، 6 منها داخل جيجل.</p>
                <p className="mt-6 leading-8 text-muted-foreground">لم نعدّ النقاط المتباعدة فقط. يجب أن يكون كل موقع بعيداً 5 كم على الأقل عن أي حريق أقدم، وأن تفصله عن المسار السابق أرض غير محترقة لمسافة 4 كم على الأقل.</p>
                <p className="mt-5 leading-8 text-muted-foreground">وصلت صور Sentinel-2 إلى النتيجة نفسها بطريقة مختلفة: 17 منطقة محترقة كبيرة، وبين أكبرها غطاء نباتي لم يحترق.</p>
                <EvidenceDetails confidence="عالية" sources="DS-01–05 · OF-06">اتفاق قياس الحرارة مع صورة آثار الاحتراق مهم: الطريقتان مستقلتان، ومع ذلك تظهران نمطاً متعدداً لا مساراً واحداً متصلاً.</EvidenceDetails>
              </div>
              <figure className="lg:col-span-4">
                <div className="overflow-hidden border bg-muted"><Image src="/generated/media/burn-severity.png" alt="خريطة توضح شدة الاحتراق في جيجل من صورة Sentinel-2" width={4946} height={2700} className="h-full w-full object-cover" /></div>
                <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">المناطق المحترقة كما ظهرت في صورة 28 أوت. الألوان داخل الخريطة تمثل شدة الاحتراق.</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section id="weather" className="scroll-mt-24 border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">03 / 06</p><h2 className="mt-3 text-2xl font-semibold">سبب سرعة الانتشار</h2></div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">مساء 26 أوت اجتمعت حرارة شديدة، هواء جاف، ورياح قوية. في الوقت نفسه قفز النشاط الحراري.</p>
            <ItemGroup className="mt-8 grid gap-0 border-y sm:grid-cols-3">
              <Item className="rounded-none px-0 py-5 sm:px-5 sm:border-s"><ItemContent><ItemTitle className="numeric text-2xl">43–45°م</ItemTitle><ItemDescription className="line-clamp-none">حرارة متوقعة في الداخل</ItemDescription></ItemContent></Item>
              <Item className="rounded-none px-0 py-5 sm:px-5 sm:border-s"><ItemContent><ItemTitle className="numeric text-2xl">8–12٪</ItemTitle><ItemDescription className="line-clamp-none">رطوبة متوقعة في الداخل</ItemDescription></ItemContent></Item>
              <Item className="rounded-none px-0 py-5 sm:px-5 sm:border-s"><ItemContent><ItemTitle className="numeric text-2xl">68 كم/س</ItemTitle><ItemDescription className="line-clamp-none">أقوى هبات متوقعة</ItemDescription></ItemContent></Item>
            </ItemGroup>
            <p className="mt-7 leading-8 text-muted-foreground">هذا يشرح لماذا كبرت الحرائق بسرعة. لكنه لا يكشف سبب الشرارة الأولى.</p>
            <EvidenceDetails confidence="عالية" sources="DS-07 · DS-08">تتفق محطتا الطقس مع النموذج الجوي على توقيت الموجة القاسية، وتتزامن الذروة مع الزيادة الكبيرة في قوة الإشعاع الحراري.</EvidenceDetails>
          </div>
        </div>
      </section>

      <section id="terrain" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">04 / 06</p><h2 className="mt-3 text-2xl font-semibold">الرياح والجبال</h2></div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">تحرك أكبر حريق عموماً نحو الشمال والشمال الشرقي، لكن 37٪ من خطواته لم تتبع اتجاه الرياح المتوقع.</p>
            <p className="mt-6 leading-8 text-muted-foreground">هذا ليس تناقضاً غريباً. جبال جيجل تغيّر حركة الهواء محلياً، والنار قد تصعد المنحدر أو تنتشر جانبياً. نموذج الطقس واسع ولا يرى كل وادٍ ومنحدر.</p>
            <p className="mt-5 leading-8 text-muted-foreground">كما أن قرب 10 من 12 بداية محتملة من الطرق لا يثبت شيئاً وحده؛ فالطرق قريبة أيضاً من أجزاء كثيرة عشوائية داخل المساحة المحترقة.</p>
            <EvidenceDetails confidence="متوسطة" sources="DS-06 · DS-08 · DS-09">استخدمنا الرياح والطرق لاختبار التفسير، لا لإثبات السبب. لا يظهر أي منهما فرقاً قوياً يسمح بربط موقع معين بفعل محدد.</EvidenceDetails>
          </div>
        </div>
      </section>

      <section id="hypotheses" className="scroll-mt-24 border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">05 / 06</p><h2 className="mt-3 text-2xl font-semibold">اختبار التفسيرات</h2></div>
          <div className="lg:col-span-9">
            <Table>
              <TableHeader><TableRow><TableHead>التفسير</TableHead><TableHead>ماذا تقول البيانات؟</TableHead><TableHead>النتيجة</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell className="whitespace-normal align-top font-medium">حريق واحد انتشر</TableCell><TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">المسافات والأراضي غير المحترقة والآثار المنفصلة لا تشبه مساراً واحداً.</TableCell><TableCell className="whitespace-normal align-top">غير مرجح · ثقة عالية</TableCell></TableRow>
                <TableRow><TableCell className="whitespace-normal align-top font-medium">حرائق مستقلة متعددة</TableCell><TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">يتفق معه الرصد الحراري وصور آثار الاحتراق وانتشار الحرائق وطنياً أثناء موجة الطقس.</TableCell><TableCell className="whitespace-normal align-top">التفسير الأبسط</TableCell></TableRow>
                <TableRow><TableCell className="whitespace-normal align-top font-medium">فعل منظم ومتعمد</TableCell><TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">لا يوجد دليل مباشر عليه، كما أن مرور الأقمار المتقطع لا يسمح بقياس تزامن دقيق.</TableCell><TableCell className="whitespace-normal align-top">لا يمكن حسمه</TableCell></TableRow>
              </TableBody>
            </Table>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">الجدول يشرح شكل الحدث، لا سبب كل حريق. لا توجد نتيجة ميدانية أو قضائية منشورة تحسم السبب حتى تاريخ التقرير.</p>
          </div>
        </div>
      </section>

      <section id="limits" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3"><p className="numeric text-xs text-muted-foreground">06 / 06</p><h2 className="mt-3 text-2xl font-semibold">ما الذي لا نعرفه؟</h2></div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-3xl font-semibold leading-snug tracking-tight">من المرجح أن البدايات ارتبطت بنشاط بشري. لكننا لا نستطيع تحديد إن كان السبب حادثاً أو إهمالاً أو فعلاً متعمداً.</p>
            <ItemGroup className="mt-9 grid gap-4 sm:grid-cols-2">
              <Item variant="muted" className="items-start"><ItemContent><ItemTitle className="line-clamp-none text-base">ما نعرفه</ItemTitle><ItemDescription className="line-clamp-none leading-7">ظهرت بدايات متعددة. الطقس سرّع الانتشار. البرق لا يفسر البدايات الرئيسية في جيجل.</ItemDescription></ItemContent></Item>
              <Item variant="muted" className="items-start"><ItemContent><ItemTitle className="line-clamp-none text-base">ما لا نعرفه</ItemTitle><ItemDescription className="line-clamp-none leading-7">لحظة كل اشتعال، وسببه المحدد، وهوية أي فاعل، وأي مسؤولية جنائية.</ItemDescription></ItemContent></Item>
            </ItemGroup>
            <Alert className="mt-8"><AlertTitle>الحد الفاصل</AlertTitle><AlertDescription>صور الأقمار تساعدنا على فهم أين ومتى انتشرت النار. التحقيق الميداني وحده يمكنه حسم السبب والمسؤولية.</AlertDescription></Alert>
            <Separator className="my-9" />
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/report" className="font-medium underline decoration-border underline-offset-8 hover:decoration-foreground">اقرأ التقرير الكامل ←</Link>
              <Link href="/methodology" className="text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground">راجع طريقة العمل</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

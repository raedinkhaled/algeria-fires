import { EdgePanel } from "@/components/editorial";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";

/**
 * رأس قسم لم يُبنَ بعد: يتبع تخطيط صفحات السرد (هامش + عمود قراءة) بهوية
 * تحريرية، بلا شارات ولا عناوين تسويقية.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  note = "يُبنى هذا القسم من ملفات التحقيق المتحقّقة، ويعرض المصدر ودرجة الثقة والقيود بجانب كل نتيجة حسّاسة.",
}: {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current={eyebrow} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[210px_1fr] lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:order-1 lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <p className="text-[11px] font-medium text-muted-foreground">القسم</p>
          <p className="mt-1 text-sm font-medium">{eyebrow}</p>
          <p className="mt-4 text-[11px] font-medium text-muted-foreground">الحالة</p>
          <p className="mt-1 text-sm">قيد الإعداد</p>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            {description}
          </p>

          <EdgePanel className="mt-10" label="ماذا سيعرض هذا القسم">
            <p className="leading-8 text-muted-foreground">{note}</p>
          </EdgePanel>
        </div>
      </div>
    </article>
  );
}

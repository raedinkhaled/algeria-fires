import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-3">
          <Badge variant="outline">{eyebrow}</Badge>
        </div>
        <div className="md:col-span-8">
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <Separator className="my-10 lg:my-14" />

      <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:me-auto md:w-8/12">
        {note}
      </p>
    </article>
  );
}

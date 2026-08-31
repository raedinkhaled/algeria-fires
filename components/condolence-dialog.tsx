"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const workDetails = [
  { term: "طبيعة العمل", value: "تحليل مستقل بالبيانات المفتوحة" },
  { term: "نطاقه", value: "مواد وبيانات مفتوحة المصدر متاحة للعامة" },
  { term: "المرجع الأول", value: "التحقيقات والبلاغات الرسمية للجهات المختصة" },
  { term: "الدافع", value: "المسؤولية والرغبة في المساعدة" },
  { term: "الغاية", value: "التوثيق وإتاحة الفهم العام" },
];

export function CondolenceDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby="condolence-description"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            كلمة إلى الأهالي
          </p>
          <DialogTitle>خالص التعازي للضحايا والمتضررين</DialogTitle>
          <DialogDescription id="condolence-description">
            إلى عائلات الضحايا، وكل من فقد بيتاً أو أرضاً أو مورداً للعيش:
            نتقدم إليكم بأصدق التعازي وأعمق المواساة.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 text-sm leading-7">
            <p>
              هذا العمل تحليل مستقل أعدّه شاب غيور على وطنه، انطلاقاً من شعوره
              بالمسؤولية ورغبته في المساعدة بطريقته: جمع المعلومات المتاحة،
              وتنظيمها، وإتاحتها للناس بوضوح.
            </p>
            <p>
              يقتصر الموقع على المواد والبيانات المفتوحة المصدر، ولا يستبدل
              التحقيق الرسمي أو نتائجه. في كل ما يتصل بالأسباب أو المسؤوليات أو
              السلامة العامة، تكون الأولوية دائماً لما تصدره الجهات المختصة.
            </p>

            <dl className="grid divide-y border-y text-sm">
              {workDetails.map((detail) => (
                <div
                  key={detail.term}
                  className="grid grid-cols-[minmax(0,7rem)_1fr] gap-4 py-2.5"
                >
                  <dt className="text-muted-foreground">{detail.term}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-5 py-4 sm:px-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              تصفح الموقع
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

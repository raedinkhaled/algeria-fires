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
  { term: "مُعدّ العمل", value: "مهندس برمجيات" },
  {
    term: "الخلفية",
    value: "درجة مكتملة في هندسة البيانات ودراسات سابقة في الذكاء الاصطناعي في الخارج",
  },
  { term: "الدافع", value: "المسؤولية والرغبة في المساعدة" },
  { term: "الغاية", value: "التوثيق وإتاحة الفهم العام" },
];

export function CondolenceDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby="condolence-description"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden border-t-2 border-t-rule p-0 sm:max-w-xl"
      >
        <DialogHeader className="shrink-0 gap-2 px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
          <p className="flex items-center gap-2.5 text-[12px] font-medium text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 bg-foreground" />
            كلمة إلى الأهالي
          </p>
          <DialogTitle className="text-[26px] font-semibold leading-[1.45]">
            خالص التعازي للضحايا والمتضررين
          </DialogTitle>
          <DialogDescription id="condolence-description" className="text-[15px] leading-8">
            إلى عائلات الضحايا، وكل من فقد بيتاً أو أرضاً أو مورداً للعيش:
            نتقدم إليكم بأصدق التعازي وأعمق المواساة.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 text-[14px] leading-8">
            <p>
              أعدّ هذا العمل مهندس برمجيات، يحمل درجة مكتملة في هندسة البيانات
              ودراسات سابقة في الذكاء الاصطناعي في الخارج. دفعته هذه
              المعرفة إلى المساعدة بطريقته: جمع المعلومات المتاحة، وتنظيمها،
              وإتاحتها للناس بوضوح.
            </p>
            <p>
              يقتصر الموقع على المواد والبيانات المفتوحة المصدر، ولا يستبدل
              التحقيق الرسمي أو نتائجه. في كل ما يتصل بالأسباب أو المسؤوليات أو
              السلامة العامة، تكون الأولوية دائماً لما تصدره الجهات المختصة.
            </p>
            <p>
              لا تُنشر البيانات الخام والخوارزميات وأدوات بايثون ومسارات معالجة
              البيانات للعامة، تفادياً لإساءة استخدامها. ويمكن توفيرها للجهات
              المختصة عند الحاجة وبما يخدم التحقيق أو الاستجابة للكارثة.
            </p>

            <dl className="grid divide-y border-y border-rule text-[13px]">
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

        <DialogFooter className="shrink-0 px-5 py-4 sm:px-8">
          <DialogClose asChild>
            <Button type="button" size="lg" className="px-5">
              تصفح الموقع
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

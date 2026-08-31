import Image from "next/image";

import { DataFigure } from "@/components/editorial";
import {
  figureGroups,
  figuresInGroup,
  type PublishedFigure,
} from "@/lib/figures";

/**
 * معرض خرائط التحقيق وأشكاله البيانية ومنتجات Sentinel-2، بترتيب ملحقَي
 * التقرير. مكوّن خادم: كل صورة `next/image` كسولة التحميل عدا الأولى.
 */

function sizeLabel(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

function FigureCard({
  item,
  priority,
}: {
  item: PublishedFigure;
  priority: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="mx-2 text-border" aria-hidden="true">
            ·
          </span>
          {item.title}
        </h3>
        <a
          href={item.path}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[11px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
        >
          الحجم الكامل
          <span className="numeric ms-1.5">
            {item.width}×{item.height}
          </span>
        </a>
      </div>

      <DataFigure
        className="mt-2.5"
        sensor={item.sensor}
        meta={sizeLabel(item.bytes)}
        caption={
          <>
            {item.caption}
            {item.note ? (
              <span className="mt-2 block border-t pt-2 text-foreground">
                {item.note}
              </span>
            ) : null}
            <span className="mt-2 block text-[11px]">{item.chapter}</span>
          </>
        }
      >
        <Image
          src={item.path}
          alt={item.caption}
          width={item.width}
          height={item.height}
          sizes="(min-width: 1280px) 36rem, (min-width: 768px) 90vw, 100vw"
          loading={priority ? "eager" : "lazy"}
          className="h-auto w-full bg-white"
        />
      </DataFigure>
    </div>
  );
}

export function FigureGallery() {
  return (
    <div className="mt-6 flex flex-col gap-12">
      {figureGroups.map((group, groupIndex) => {
        const items = figuresInGroup(group.id);
        return (
          <section key={group.id} id={`figures-${group.id}`} className="scroll-mt-20">
            <div className="flex items-baseline gap-3 border-b pb-2">
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <span className="numeric text-[11px] text-muted-foreground">
                {items.length}
              </span>
            </div>

            <div className="mt-6 grid gap-x-8 gap-y-10 xl:grid-cols-2">
              {items.map((item, index) => (
                <FigureCard
                  key={item.id}
                  item={item}
                  priority={groupIndex === 0 && index === 0}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

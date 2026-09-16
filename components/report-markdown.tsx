import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function withoutNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node, ...rest } = props;
  void node;
  return rest;
}

const components: Components = {
  h1: (props) => (
    <h2
      className="mt-20 scroll-mt-28 border-t border-rule pt-6 text-[clamp(1.625rem,3vw,2.375rem)] font-semibold leading-[1.45] first:mt-10 print:mt-10 print:pt-4 print:text-2xl"
      {...withoutNode(props)}
    />
  ),
  h2: (props) => (
    <h3
      className="mt-14 scroll-mt-28 text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-[1.65] print:mt-8 print:text-xl"
      {...withoutNode(props)}
    />
  ),
  h3: (props) => (
    <h4
      className="mt-10 scroll-mt-28 text-lg font-semibold leading-8 print:mt-6"
      {...withoutNode(props)}
    />
  ),
  h4: (props) => (
    <h5
      className="mt-8 scroll-mt-28 text-base font-semibold leading-8 print:mt-5"
      {...withoutNode(props)}
    />
  ),
  p: (props) => (
    <p className="my-5 text-[16.5px] leading-[1.95] print:text-[10.5pt] print:leading-7" {...withoutNode(props)} />
  ),
  a: (rawProps) => {
    const { href = "", ...props } = withoutNode(rawProps);
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="break-words underline decoration-border underline-offset-4 hover:decoration-foreground"
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        {...props}
      />
    );
  },
  blockquote: (props) => (
    <blockquote
      className="my-10 border-s-2 border-s-signal bg-card px-6 py-2 [&_h4]:mt-4 print:my-6 print:bg-transparent"
      {...withoutNode(props)}
    />
  ),
  ul: (props) => (
    <ul
      className="my-5 flex list-disc flex-col gap-2 pe-6 marker:text-signal print:marker:text-foreground"
      {...withoutNode(props)}
    />
  ),
  ol: (props) => (
    <ol
      className="my-5 flex list-decimal flex-col gap-2 pe-6 marker:font-mono marker:text-[0.85em] marker:text-muted-foreground"
      {...withoutNode(props)}
    />
  ),
  li: (props) => <li className="ps-1 text-[16px] leading-8 print:text-[10.5pt] print:leading-7" {...withoutNode(props)} />,
  hr: () => <Separator className="my-14 print:my-8" />,
  code: (props) => (
    <code
      dir="ltr"
      className="ltr-embed bg-muted px-1.5 py-0.5 text-[0.85em] [overflow-wrap:anywhere]"
      {...withoutNode(props)}
    />
  ),
  pre: (props) => (
    <pre
      dir="ltr"
      className="my-6 overflow-x-auto border-t border-rule bg-card p-4 text-left text-sm leading-7 [&>code]:bg-transparent [&>code]:p-0"
      {...withoutNode(props)}
    />
  ),
  table: (props) => <Table className="my-8" {...withoutNode(props)} />,
  thead: (props) => <TableHeader {...withoutNode(props)} />,
  tbody: (props) => <TableBody {...withoutNode(props)} />,
  tr: (props) => <TableRow {...withoutNode(props)} />,
  th: (props) => (
    <TableHead
      className="min-w-36 whitespace-normal align-top py-3"
      {...withoutNode(props)}
    />
  ),
  td: (props) => (
    <TableCell
      className="min-w-36 whitespace-normal align-top py-3 leading-7"
      {...withoutNode(props)}
    />
  ),
};

export function ReportMarkdown({ source }: { source: string }) {
  return (
    <div className="text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={components}
        skipHtml
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

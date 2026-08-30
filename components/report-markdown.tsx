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
      className="scroll-mt-24 pt-12 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
      {...withoutNode(props)}
    />
  ),
  h2: (props) => (
    <h3
      className="scroll-mt-24 pt-10 text-2xl font-semibold leading-snug tracking-tight"
      {...withoutNode(props)}
    />
  ),
  h3: (props) => (
    <h4
      className="scroll-mt-24 pt-8 text-xl font-semibold leading-8"
      {...withoutNode(props)}
    />
  ),
  h4: (props) => (
    <h5
      className="scroll-mt-24 pt-7 text-lg font-semibold leading-8"
      {...withoutNode(props)}
    />
  ),
  p: (props) => <p className="my-5 leading-8" {...withoutNode(props)} />,
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
      className="my-8 border-s-2 bg-muted/35 py-1 ps-6 pe-4"
      {...withoutNode(props)}
    />
  ),
  ul: (props) => (
    <ul
      className="my-5 flex list-disc flex-col gap-2 pe-6 marker:text-muted-foreground"
      {...withoutNode(props)}
    />
  ),
  ol: (props) => (
    <ol
      className="my-5 flex list-decimal flex-col gap-2 pe-6 marker:text-muted-foreground"
      {...withoutNode(props)}
    />
  ),
  li: (props) => <li className="ps-1 leading-8" {...withoutNode(props)} />,
  hr: () => <Separator className="my-12" />,
  code: (props) => (
    <code
      dir="ltr"
      className="ltr-embed rounded-sm bg-muted px-1.5 py-0.5 text-sm [overflow-wrap:anywhere]"
      {...withoutNode(props)}
    />
  ),
  pre: (props) => (
    <pre
      dir="ltr"
      className="my-6 overflow-x-auto border bg-muted p-4 text-left text-sm leading-7 [&>code]:bg-transparent [&>code]:p-0"
      {...withoutNode(props)}
    />
  ),
  table: (props) => <Table className="my-7" {...withoutNode(props)} />,
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

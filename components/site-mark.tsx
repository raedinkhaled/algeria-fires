/**
 * العلامة: إطار بكسل قمري بزوايا تسجيل، وفي داخله خلية رصد حراري واحدة.
 * الإطار بلون الحبر، والخلية بالجمري في الوضعين.
 */
export function SiteMark({
  size = 20,
  title,
}: {
  size?: number;
  title?: string;
}) {
  const decorative = !title;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      fill="none"
      className="block shrink-0 text-foreground"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M2.75 8V2.75H8M16 2.75h5.25V8M21.25 16v5.25H16M8 21.25H2.75V16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8.5 12h-3M18.5 12h-3M12 8.5v-3M12 18.5v-3" stroke="currentColor" strokeWidth="1" />
      <rect x="9.5" y="9.5" width="5" height="5" fill="var(--signal)" />
    </svg>
  );
}

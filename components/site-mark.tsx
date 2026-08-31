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
        d="M4 18c3.2-1.6 4.7-4.2 5.6-7.2C10.5 7.9 12.5 5.6 15.6 4c-.2 4 2.4 5.6 3.8 8 1.7 2.9 1.2 5.3-.5 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M7.5 18c2.7-1.2 4.1-3.3 4.8-5.5.7-2.1 1.8-3.4 3.7-4.6 0 2.8 1.6 4.1 2.3 6 .6 1.6.5 2.8 0 4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M4 20h16M12 16v4M10 18h4" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

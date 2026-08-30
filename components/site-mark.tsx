export function SiteMark({
  size = 36,
  title,
}: {
  size?: number;
  title?: string;
}) {
  const decorative = !title;

  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      fill="currentColor"
      className="block text-foreground"
    >
      {title ? <title>{title}</title> : null}
      <path d="M1 1h34v34H1z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6h9v9H6zM21 6h9v9h-9zM6 21h9v9H6z" opacity="0.28" />
      <path d="M21 21h9v9h-9z" />
      <path d="M18 4v28M4 18h28" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

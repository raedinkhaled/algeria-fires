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
      viewBox="0 0 20 20"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      fill="none"
      className="block shrink-0 text-foreground"
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="1.25"
        y="1.25"
        width="17.5"
        height="17.5"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M1.25 6.5H18.75M6.5 1.25V6.5"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <circle cx="3.875" cy="3.875" r="1.1" fill="currentColor" />
    </svg>
  );
}

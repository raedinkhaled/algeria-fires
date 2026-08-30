export function SiteMark({
  size = 40,
  title,
}: {
  size?: number;
  title?: string;
}) {
  const decorative = !title;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      fill="none"
      className="block text-foreground"
    >
      {title ? <title>{title}</title> : null}
      <g stroke="currentColor" strokeLinecap="round">
        <path
          d="M24 3.5c11.3 0 20.5 9.2 20.5 20.5S35.3 44.5 24 44.5 3.5 35.3 3.5 24 12.7 3.5 24 3.5Z"
          opacity="0.25"
          strokeWidth="1.5"
        />
        <path
          d="M25 9c8.3.5 14.9 7.4 14.9 15.8 0 8.7-7.1 15.8-15.9 15.8-6.7 0-12.4-4.1-14.8-10"
          opacity="0.48"
          strokeWidth="1.5"
        />
        <path
          d="M23 15.2c5-.5 9.6 3 10.5 8 .9 5-2.4 9.8-7.4 10.9-4.4.9-8.8-1.6-10.3-5.7"
          opacity="0.78"
          strokeWidth="1.6"
        />
      </g>
      <circle cx="24" cy="24" r="3.4" fill="var(--primary)" />
      <path
        d="M24 20.6V10"
        stroke="var(--primary)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

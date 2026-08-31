const localOrigin = "http://localhost:3000";

function configuredOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  const vercelUrl = process.env.VERCEL_URL;
  return vercelUrl ? `https://${vercelUrl}` : localOrigin;
}

export const siteUrl = new URL(configuredOrigin());

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

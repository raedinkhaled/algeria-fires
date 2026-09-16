"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** يربط فهرس القراءة بالقسم الظاهر، مع إبقاء الروابط العادية بلا جافاسكربت. */
export function ChapterTracking() {
  const pathname = usePathname();

  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.publication-sidebar a[href^="#"]'),
    );
    const targets = links.flatMap((link) => {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      return target ? [{ link, target }] : [];
    });
    if (!targets.length) return;

    const update = () => {
      const threshold = window.innerHeight * 0.4;
      let current = targets[0];
      for (const entry of targets) {
        if (entry.target.getBoundingClientRect().top <= threshold) current = entry;
      }
      for (const entry of targets) {
        if (entry === current) entry.link.setAttribute("aria-current", "location");
        else entry.link.removeAttribute("aria-current");
      }
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-10% 0px -60% 0px",
      threshold: 0,
    });
    targets.forEach(({ target }) => observer.observe(target));
    update();
    return () => {
      observer.disconnect();
      links.forEach((link) => link.removeAttribute("aria-current"));
    };
  }, [pathname]);

  return null;
}

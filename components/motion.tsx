"use client";

import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

const editorialEase = [0.16, 1, 0.3, 1] as const;

export function ReadingProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px origin-right bg-foreground"
      style={{ scaleX }}
    />
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0.92, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.48, delay, ease: editorialEase }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Kopf- und Fußleiste gehören zur Website, nicht zur Inhaltsverwaltung.
 * Unter /admin bleibt der Bildschirm der Bearbeitung vorbehalten.
 */
export function NurWebsite({ children }: { children: ReactNode }) {
  const pfad = usePathname();
  if (pfad?.startsWith("/admin")) return null;
  return <>{children}</>;
}

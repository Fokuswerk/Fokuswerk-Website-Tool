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

/**
 * Der Hauptbereich der Website. Die Inhaltsverwaltung bringt ihren eigenen
 * mit – lägen zwei davon ineinander, wüsste eine Vorlesesoftware nicht, zu
 * welchem die Sprungmarke führt.
 */
export function Hauptbereich({ children }: { children: ReactNode }) {
  const pfad = usePathname();
  if (pfad?.startsWith("/admin")) return <>{children}</>;
  return <main id="inhalt">{children}</main>;
}

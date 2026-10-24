import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projekt",
  description:
    "Serienplanung von Einbauküchen für Wohnbauprojekte: Grundrisse einlesen, typisieren, planen, spezifizieren.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

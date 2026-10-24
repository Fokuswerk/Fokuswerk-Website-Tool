import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projektübersicht",
  description:
    "Serienplanung von Einbauküchen für Wohnbauprojekte: Grundrisse einlesen, typisieren, planen, spezifizieren.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

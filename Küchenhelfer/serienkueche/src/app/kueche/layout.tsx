import type { Metadata } from "next";

/* Eigener Titel fuer den Privatkundenweg: im Browsertab und in jeder
   geteilten Vorschau stand vorher "Serienplanung fuer Wohnbauprojekte". */
export const metadata: Metadata = {
  title: "Küche planen",
  description:
    "Beschreib deinen Raum, such deine Geräte aus — wir rechnen dir eine Küche, die wirklich passt. Mit jedem Schrank, jedem Maß und einem Preis.",
};

export default function KuecheLayout({ children }: { children: React.ReactNode }) {
  return children;
}

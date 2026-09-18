import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Inhalte pflegen",
  robots: { index: false, follow: false },
};

/** Der Verwaltungsbereich läuft ohne Kopf- und Fußleiste der Website. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-bereich">{children}</div>;
}

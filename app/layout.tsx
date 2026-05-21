import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Website Tool",
    template: "%s · Website Tool",
  },
  description: "Demo-Websites für lokale Unternehmen – schnell erstellt, direkt versendet.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sehr einfacher Zugangsschutz für die Auswertung.
 * Ohne gesetztes ADMIN_PASSWORT bleibt der Bereich im Demo-Modus und zeigt
 * grundsätzlich keine echten Daten — so kann nichts versehentlich offenstehen.
 */

const KEKS = "pga_zugang";

export function passwortGesetzt(): boolean {
  return Boolean(process.env.ADMIN_PASSWORT && process.env.ADMIN_PASSWORT.length >= 8);
}

export function merkmal(passwort: string): string {
  return createHash("sha256").update(`pflegegeld-antrag:${passwort}`).digest("hex");
}

function gleich(a: string, b: string): boolean {
  const pa = Buffer.from(a);
  const pb = Buffer.from(b);
  return pa.length === pb.length && timingSafeEqual(pa, pb);
}

export async function angemeldet(): Promise<boolean> {
  if (!passwortGesetzt()) return false;
  const wert = (await cookies()).get(KEKS)?.value;
  if (!wert) return false;
  return gleich(wert, merkmal(process.env.ADMIN_PASSWORT as string));
}

export const KEKS_NAME = KEKS;

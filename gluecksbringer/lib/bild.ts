import type { StaticImageData } from "next/image";

/**
 * Eingebaute Bilder bringen eine unscharfe Vorschau mit, hochgeladene nicht.
 * `placeholder="blur"` ohne Vorschau lässt next/image abbrechen – deshalb
 * entscheidet diese Funktion je Bild, was möglich ist.
 */
export function platzhalter(bild: StaticImageData): "blur" | "empty" {
  return bild.blurDataURL ? "blur" : "empty";
}

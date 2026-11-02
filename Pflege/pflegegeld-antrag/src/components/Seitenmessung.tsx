"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { melden } from "@/lib/messen";

/** Meldet einen Seitenaufruf, einmal je Pfad. */
export default function Seitenmessung() {
  const pfad = usePathname();
  useEffect(() => {
    melden("seite", { pfad });
  }, [pfad]);
  return null;
}

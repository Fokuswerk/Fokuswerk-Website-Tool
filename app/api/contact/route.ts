import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { site_slug, site_id, name, email, phone, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim() || !site_slug) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const { error } = await supabase.from("contact_submissions").insert({
    site_slug,
    site_id: site_id || null,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    message: message.trim(),
  });

  if (error) {
    console.error("contact_submissions insert error:", error);
    return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

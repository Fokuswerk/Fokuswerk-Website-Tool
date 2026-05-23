import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY nicht gesetzt" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say ok" }],
    });
    return NextResponse.json({
      ok: true,
      key_prefix: apiKey.slice(0, 15) + "...",
      response: msg.content[0].type === "text" ? msg.content[0].text : "ok",
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      key_prefix: apiKey.slice(0, 15) + "...",
    });
  }
}

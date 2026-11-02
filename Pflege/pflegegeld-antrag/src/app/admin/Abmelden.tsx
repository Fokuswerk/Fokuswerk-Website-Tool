"use client";

export default function Abmelden() {
  async function raus() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ abmelden: true }),
    }).catch(() => {});
    location.reload();
  }
  return (
    <button type="button" className="knopf knopf-zweit" onClick={raus}>
      Abmelden
    </button>
  );
}

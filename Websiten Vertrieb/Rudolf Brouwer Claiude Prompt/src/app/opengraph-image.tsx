import { ImageResponse } from "next/og";

export const alt = "Brouwer GmbH — Bad, Heizung und Pool in Wardenburg";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgBild() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(115deg, #0b1229 0%, #101a38 55%, #1b347d 100%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", color: "#f4f1e9", opacity: 0.6, fontSize: 24, letterSpacing: 4 }}>
          SEIT 1962 IN WARDENBURG
        </div>
        <div
          style={{
            display: "flex",
            color: "#f4f1e9",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2,
            marginTop: 24,
            lineHeight: 1.05,
          }}
        >
          Ihr Bad. Ihre Heizung.
        </div>
        <div style={{ display: "flex", color: "#c2703a", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
          Ein Ansprechpartner.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid rgba(244,241,233,0.2)",
            color: "#f4f1e9",
            opacity: 0.7,
            fontSize: 24,
            letterSpacing: 3,
          }}
        >
          BROUWER GMBH · HEIZUNG · SANITÄR · SCHWIMMBAD
        </div>
      </div>
    ),
    size,
  );
}

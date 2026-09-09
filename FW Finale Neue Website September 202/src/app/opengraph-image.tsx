import { ImageResponse } from 'next/og';

export const alt = 'Fokuswerk — ein Drehtag im Monat, zwei Kampagnen: Mitarbeiter und Kunden';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgBild() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0c0f14',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 11, background: '#fbfaf9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 12, height: 12, background: '#0c0f14' }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#fbfaf9', letterSpacing: -1 }}>
            Fokuswerk
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 34, color: '#b3bac4', letterSpacing: -0.8 }}>
            Ein Drehtag im Monat.
          </div>
          <div style={{ fontSize: 82, fontWeight: 800, color: '#ffffff', letterSpacing: -3.4, marginTop: 6 }}>
            Zwei Kampagnen.
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: '#e3b778', letterSpacing: -1.4, marginTop: 10 }}>
            Mitarbeiter und Kunden.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 44, borderTop: '1px solid #ffffff26', paddingTop: 26 }}>
          {[
            ['550,27 €', 'Werbebudget'],
            ['68', 'Bewerbungen'],
            ['14 Tage', 'bis zur Unterschrift'],
          ].map(([w, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: -1.2 }}>{w}</div>
              <div style={{ fontSize: 18, color: '#868f9a', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

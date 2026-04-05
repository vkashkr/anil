import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Aliya Escort Ahmedabad — Verified Call Girls in Ahmedabad, Gujarat';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #1a0028 45%, #180018 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
          gap: '18px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            background: '#86198f',
            color: '#fce7f3',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '8px 28px',
            borderRadius: '999px',
            display: 'flex',
          }}
        >
          ✔ VERIFIED PROFILES · AHMEDABAD
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: '#f9a8d4',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          Aliya Escort Ahmedabad
        </div>

        {/* Sub-title */}
        <div
          style={{
            fontSize: '28px',
            color: '#e4e4e7',
            textAlign: 'center',
            lineHeight: 1.4,
            display: 'flex',
          }}
        >
          Independent Call Girls in Ahmedabad, Gujarat
        </div>

        {/* Feature row */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['24/7 Available', 'No Advance', 'Incall & Outcall', 'Real Photos'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#d1d5db',
                fontSize: '20px',
                padding: '8px 22px',
                borderRadius: '12px',
                display: 'flex',
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: '20px',
            color: '#a855f7',
            marginTop: '8px',
            display: 'flex',
          }}
        >
          aliyaescort.com/ahmedabad
        </div>
      </div>
    ),
    { ...size },
  );
}

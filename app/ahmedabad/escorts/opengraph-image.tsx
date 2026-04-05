import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Ahmedabad Escort Service — Browse Verified Call Girls | Aliya Escort';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #2d001f 40%, #0d001a 100%)',
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
        {/* Top breadcrumb */}
        <div
          style={{
            fontSize: '16px',
            color: '#a1a1aa',
            letterSpacing: '0.1em',
            display: 'flex',
            gap: '8px',
          }}
        >
          <span style={{ color: '#f472b6' }}>aliyaescort.com</span>
          <span>›</span>
          <span style={{ color: '#e4e4e7' }}>Ahmedabad Escort</span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '62px',
            fontWeight: 900,
            color: '#f9a8d4',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          Ahmedabad Escort Service
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: '26px',
            color: '#d1d5db',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          1000+ Verified Independent Escorts in Ahmedabad
        </div>

        {/* Tags */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['College Girls', 'Housewife', 'VIP Escort', 'Hotel Delivery', 'No Advance'].map((t) => (
            <div
              key={t}
              style={{
                background: 'rgba(236,72,153,0.15)',
                border: '1px solid rgba(236,72,153,0.35)',
                color: '#f9a8d4',
                fontSize: '18px',
                padding: '7px 18px',
                borderRadius: '999px',
                display: 'flex',
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Available badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#6ee7b7',
            fontSize: '20px',
            padding: '8px 24px',
            borderRadius: '999px',
          }}
        >
          🟢 24/7 Available · SG Highway · Satellite · Vastrapur
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Šapica — Pronađite čuvara za svog ljubimca';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Paw icon */}
        <svg width="120" height="120" viewBox="0 0 100 100" fill="#f97316">
          <ellipse cx="50" cy="62" rx="14" ry="16" />
          <ellipse cx="30" cy="38" rx="8" ry="11" />
          <ellipse cx="70" cy="38" rx="8" ry="11" />
          <ellipse cx="20" cy="56" rx="7" ry="10" />
          <ellipse cx="80" cy="56" rx="7" ry="10" />
        </svg>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#f97316',
            marginTop: 20,
            letterSpacing: '-0.02em',
          }}
        >
          Šapica
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#78716c',
            marginTop: 12,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Pronađite pouzdane čuvare ljubimaca u vašem gradu
        </div>

        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 40,
            fontSize: 18,
            color: '#a8a29e',
          }}
        >
          <span>500+ sittera</span>
          <span>50+ gradova</span>
          <span>4.8 ocjena</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

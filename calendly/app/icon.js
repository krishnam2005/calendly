import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#2563eb', // text-blue-600
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
          fontWeight: 900
        }}
      >
        <span style={{ transform: 'translateY(-1px)' }}>S</span>
      </div>
    ),
    { ...size }
  );
}

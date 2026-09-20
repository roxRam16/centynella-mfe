import { palette } from '@/theme/palette';

/**
 * Fondo decorativo de las pantallas de acceso: degradado iris con formas geométricas
 * (círculo, puntos y "skyline" de barras), inspirado en el diseño del login.
 * Es SVG puro (sin peticiones) y va oculto para lectores de pantalla.
 */
export function AuthBackground() {
  const skyline = [40, 70, 28, 96, 54, 120, 36, 80, 62, 110, 44, 88];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 800"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="auth-bg-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.brand.iris} />
          <stop offset="55%" stopColor="#6567EA" />
          <stop offset="100%" stopColor="#5C62D4" />
        </linearGradient>
        <pattern id="auth-bg-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2" fill="#FFFFFF" fillOpacity="0.28" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#auth-bg-gradient)" />
      <circle cx="80" cy="60" r="280" fill="#FFFFFF" fillOpacity="0.08" />
      <circle cx="80" cy="60" r="190" fill="#FFFFFF" fillOpacity="0.06" />
      <rect x="880" y="10" width="300" height="200" fill="url(#auth-bg-dots)" />
      {skyline.map((height, index) => (
        <rect
          key={index}
          x={index * 30}
          y={800 - height}
          width="22"
          height={height}
          fill="#FFFFFF"
          fillOpacity="0.1"
        />
      ))}
      {skyline.map((height, index) => (
        <rect
          key={`r${index}`}
          x={840 + index * 30}
          y={800 - height * 1.3}
          width="22"
          height={height * 1.3}
          fill="#FFFFFF"
          fillOpacity="0.1"
        />
      ))}
    </svg>
  );
}

/**
 * Ilustración isométrica del panel izquierdo del login: pantalla con verificación,
 * candado y credencial. Es una interpretación propia del diseño; cuando exista el arte
 * original (SVG), se reemplaza solo este componente.
 */
export function AuthIllustration() {
  const diamond = (x: number, y: number, size: number, color = '#D0CCFE') => (
    <polygon
      key={`${x}-${y}`}
      points={`${x},${y - size} ${x + size * 1.6},${y} ${x},${y + size} ${x - size * 1.6},${y}`}
      fill={color}
    />
  );

  return (
    <svg
      role="img"
      aria-label="Ilustración de acceso seguro"
      viewBox="0 0 420 380"
      style={{ width: '100%', maxWidth: 420, height: 'auto' }}
    >
      <defs>
        <linearGradient id="illustration-screen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DAE3FC" />
          <stop offset="100%" stopColor="#86B0FE" />
        </linearGradient>
      </defs>

      {/* Plataforma isométrica */}
      <polygon points="210,338 360,268 210,198 60,268" fill="#EFEDFE" />
      <polygon points="210,320 330,264 210,208 90,264" fill="#E6E4FD" />

      {/* Rombos decorativos */}
      {diamond(60, 300, 9)}
      {diamond(372, 210, 7)}
      {diamond(150, 352, 8, '#C9C4FB')}
      {diamond(330, 330, 6)}
      {diamond(110, 160, 6)}

      {/* Pantalla */}
      <polygon points="105,118 255,64 255,214 105,268" fill="url(#illustration-screen)" />
      <polygon points="105,118 255,64 255,74 105,128" fill="#FFFFFF" fillOpacity="0.5" />
      {/* Avatar en pantalla */}
      <polygon points="122,150 176,131 176,201 122,220" fill="#FFFFFF" fillOpacity="0.55" />
      <circle cx="149" cy="168" r="10" fill="#B7BFF5" />
      <path d="M131 208 q18 -22 36 -32 v34 z" fill="#B7BFF5" />
      {/* Líneas de texto */}
      <polygon points="190,124 236,108 236,114 190,130" fill="#FFFFFF" />
      <polygon points="190,142 226,129 226,134 190,147" fill="#FFFFFF" fillOpacity="0.75" />
      <polygon points="190,158 218,148 218,153 190,163" fill="#5FD6EB" />

      {/* Insignia de verificación */}
      <circle cx="108" cy="118" r="22" fill="#5FD6EB" />
      <path
        d="M98 118 l7 8 l14 -16"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Candado */}
      <path d="M282 196 v-26 a24 24 0 0 1 48 0 v26" fill="none" stroke="#9CD4FA" strokeWidth="9" />
      <polygon points="266,196 344,170 344,250 266,276" fill="#24C0E7" />
      <polygon points="266,196 306,183 306,263 266,276" fill="#1EA9CD" fillOpacity="0.45" />
      <circle cx="312" cy="222" r="8" fill="#0F7F9E" />
      <rect x="309" y="224" width="6" height="16" rx="2" fill="#0F7F9E" />

      {/* Credencial */}
      <polygon points="188,300 250,276 300,300 238,326" fill="#FB959F" />
      <circle cx="222" cy="302" r="8" fill="#FFFFFF" fillOpacity="0.85" />
      <polygon points="240,296 276,296 276,302 240,302" fill="#FFFFFF" fillOpacity="0.85" />

      {/* Hoja de datos */}
      <polygon points="78,250 138,228 138,318 78,340" fill="#FFFFFF" />
      <polygon points="92,262 124,250 124,255 92,267" fill="#F5A25D" />
      <polygon points="92,278 124,266 124,270 92,282" fill="#B7BFF5" />
      <polygon points="92,292 116,283 116,287 92,296" fill="#B7BFF5" />
      <polygon points="92,306 108,300 108,304 92,310" fill="#5FD6EB" />
    </svg>
  );
}
